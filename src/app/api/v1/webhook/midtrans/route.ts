import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import {
  verifySignature,
  mapMidtransStatusToOrderStatus,
  mapMidtransPaymentType,
  checkTransactionStatus
} from '@/src/utils/payment/midtrans.util';
import {
  updateUserMissions,
  updateReferrerMissions,
  updateUserStatistics,
  updateReferrerStatistics
} from '@/src/utils/mission/missionUpdate.util';

/**
 * Handle Midtrans payment notification webhook
 * This endpoint receives payment status updates from Midtrans
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
      transaction_id: transactionId,
      transaction_time: transactionTime,
      settlement_time: settlementTime,
    } = body;

    // Verify signature
    const isValid = verifySignature(
      orderId,
      statusCode,
      grossAmount,
      signatureKey
    );

    if (!isValid) {
      console.error('Invalid signature for order:', orderId);
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Get additional transaction details from Midtrans API
    const transactionData = await checkTransactionStatus(orderId);

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderId,
        enabled: true,
      },
      include: {
        paymentLogs: true,
        user: true,
      }
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Map Midtrans status to order status
    const newOrderStatus = mapMidtransStatusToOrderStatus(transactionStatus, fraudStatus);
    
    // Map payment type
    const mappedPaymentMethod = mapMidtransPaymentType(paymentType);

    // Start a transaction to update order and create payment log
    const result = await prisma.$transaction(async (tx) => {
      let paymentLog = null;
      let isFullyPaid = false;

      // Update order status and payment tracking
      let updateData: any = {
        status: newOrderStatus,
        updatedAt: new Date(),
      };

      // If payment is successful, create payment log and update amounts
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        const paidAmount = parseFloat(grossAmount);
        const newAmountPaid = Number(order.amountPaid) + paidAmount;
        const newRemainingBalance = Number(order.total) - newAmountPaid;

        // Create payment log for successful payment
        paymentLog = await tx.paymentLog.create({
          data: {
            orderId: order.id,
            amount: paidAmount,
            paymentProvider: 'MIDTRANS',
            paymentMethod: mappedPaymentMethod,
            transactionId: transactionId,
            notes: `Midtrans payment: ${transactionStatus} (${fraudStatus || 'N/A'})`,
            paidAt: settlementTime ? new Date(settlementTime) : new Date(transactionTime),
          }
        });

        updateData.amountPaid = newAmountPaid;
        updateData.remainingBalance = Math.max(0, newRemainingBalance);

        // Check if order is fully paid
        const wasNotFullyPaid = Number(order.remainingBalance) > 0;
        isFullyPaid = newRemainingBalance <= 0;

        // If fully paid, update status to PROCESSING if not already in a later stage
        if (isFullyPaid && order.status === 'PENDING_PAYMENT') {
          updateData.status = 'PROCESSING';
        }

        // If this payment completes the order (not a partial payment that was already completed)
        if (isFullyPaid && wasNotFullyPaid) {
          // Update user statistics
          await updateUserStatistics(tx, order.userId, Number(order.total));

          // Update user missions based on order
          await updateUserMissions(tx, order.userId, Number(order.total));

          // If there's a referrer, update their statistics and missions
          if (order.referrerId) {
            const commissionAmount = Number(order.affiliateCommission);
            
            if (commissionAmount > 0) {
              // Update referrer's earnings statistics
              await updateReferrerStatistics(tx, order.referrerId, commissionAmount);

              // Update referrer's missions
              await updateReferrerMissions(tx, order.referrerId, commissionAmount);

              // Increment referrer's totalReferrals if this is the user's first completed order
              const userPreviousOrders = await tx.order.count({
                where: {
                  userId: order.userId,
                  status: {
                    in: ['PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED']
                  },
                  id: {
                    not: order.id // Exclude current order
                  }
                }
              });

              // If this is the user's first completed order, increment referrer's total referrals
              if (userPreviousOrders === 0) {
                const referrerStats = await tx.userStatistics.findUnique({
                  where: { userId: order.referrerId }
                });

                if (referrerStats) {
                  await tx.userStatistics.update({
                    where: { userId: order.referrerId },
                    data: {
                      totalReferrals: referrerStats.totalReferrals + 1,
                      updatedAt: new Date()
                    }
                  });
                }
              }
            }
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: updateData,
      });

      return { order: updatedOrder, paymentLog, isFullyPaid };
    });

    console.log(`Order ${orderId} updated: ${transactionStatus} -> ${newOrderStatus}${result.isFullyPaid ? ' (Fully Paid - Missions & Statistics Updated)' : ''}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Notification processed successfully',
        data: {
          orderId: orderId,
          orderStatus: newOrderStatus,
          transactionStatus: transactionStatus,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process notification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET request to check webhook endpoint status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      message: 'Midtrans webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
