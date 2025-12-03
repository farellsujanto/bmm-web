import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import {
  verifySignature,
  mapMidtransStatusToOrderStatus,
} from '@/src/utils/payment/midtrans.util';
import { processPayment } from '@/src/utils/payment/paymentProcessor.util';

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
    const isValid = verifySignature(orderId, statusCode, grossAmount, signatureKey);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Extract order number from transaction ID (format: ORDER123-DP, ORDER123-FULL, ORDER123-CLR)
    const actualOrderNumber = orderId.split('-')[0];

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: actualOrderNumber,
        enabled: true,
      },
      include: {
        paymentLogs: true,
        user: true,
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Ignore cancellations if order already has payment (DP paid, clearance cancelled)
    const hasPreviousPayment = Number(order.amountPaid) > 0;
    const isCancellation = ['cancel', 'expire', 'deny', 'failure'].includes(transactionStatus);
    
    if (hasPreviousPayment && isCancellation) {
      return NextResponse.json(
        { success: true, message: 'Cancellation ignored - order has existing payment' },
        { status: 200 }
      );
    }

    // Process payment
    const result = await processPayment({
      order,
      transactionData: {
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        gross_amount: grossAmount,
        payment_type: paymentType,
        transaction_id: transactionId,
        transaction_time: transactionTime,
        settlement_time: settlementTime,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification processed successfully',
        data: {
          orderId: actualOrderNumber,
          transactionId: orderId,
          orderStatus: result.order.status,
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
