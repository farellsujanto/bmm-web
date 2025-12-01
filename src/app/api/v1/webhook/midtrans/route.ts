import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import {
  verifySignature,
  mapMidtransStatusToOrderStatus,
  mapMidtransPaymentType,
  checkTransactionStatus
} from '@/src/utils/payment/midtrans.util';

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

        // If fully paid, update status to CONFIRMED if not already in a later stage
        if (newRemainingBalance <= 0 && order.status === 'PENDING_PAYMENT') {
          updateData.status = 'CONFIRMED';
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: updateData,
      });

      return { order: updatedOrder, paymentLog };
    });

    console.log(`Order ${orderId} updated: ${transactionStatus} -> ${newOrderStatus}`);

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
