import {
  mapMidtransPaymentType,
  mapMidtransStatusToOrderStatus,
  checkTransactionStatus
} from './midtrans.util';
import {
  updateUserMissions,
  updateReferrerMissions,
  updateUserStatistics,
  updateReferrerStatistics
} from '../mission/missionUpdate.util';
import prisma from '../database/prismaOrm.util';

interface TransactionData {
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
  payment_type: string;
  transaction_id: string;
  transaction_time: string;
  settlement_time?: string;
}

interface ProcessPaymentParams {
  order: any;
  transactionData?: TransactionData;
  orderInclude?: any;
}

interface ProcessPaymentResult {
  order: any;
  paymentLog: any | null;
  isFullyPaid: boolean;
  updated: boolean;
}

/**
 * Process payment from Midtrans transaction data
 * Can accept transaction data directly (webhook) or fetch it (sync)
 * Handles payment log creation, amount updates, and mission/statistics updates
 */
/**
 * Process payment from Midtrans transaction data
 * Can accept transaction data directly (webhook) or fetch it (sync)
 * Handles payment log creation, amount updates, and mission/statistics updates
 */
export async function processPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  const { order, transactionData: providedTransactionData, orderInclude } = params;

  // If no transaction data provided, fetch it from Midtrans
  let transactionData = providedTransactionData;

  if (!transactionData) {
    // Only sync for orders that can be updated
    if (!['PENDING_PAYMENT', 'PROCESSING', 'READY_TO_SHIP'].includes(order.status)) {
      return { order, paymentLog: null, isFullyPaid: false, updated: false };
    }

    // Check currentPaymentId if exists
    if (!order.currentPaymentId) {
      return { order, paymentLog: null, isFullyPaid: false, updated: false };
    }

    try {
      transactionData = await checkTransactionStatus(order.currentPaymentId);
      
      if (!transactionData) {
        return { order, paymentLog: null, isFullyPaid: false, updated: false };
      }

      // Only update if payment successful
      if (transactionData.transaction_status !== 'settlement' && 
          transactionData.transaction_status !== 'capture') {
        return { order, paymentLog: null, isFullyPaid: false, updated: false };
      }
    } catch (error) {
      return { order, paymentLog: null, isFullyPaid: false, updated: false };
    }
  }

  // Process payment in transaction
  const result = await prisma.$transaction(async (tx) => {
    const newOrderStatus = mapMidtransStatusToOrderStatus(
      transactionData!.transaction_status,
      transactionData!.fraud_status
    );

    const updateData: any = {
      status: newOrderStatus,
      updatedAt: new Date(),
    };

    let paymentLog = null;
    let isFullyPaid = false;

    // Process successful payment
    if (transactionData!.transaction_status === 'settlement' || 
        transactionData!.transaction_status === 'capture') {
      const paidAmount = parseFloat(transactionData!.gross_amount);
      const newAmountPaid = Number(order.amountPaid) + paidAmount;
      const newRemainingBalance = Number(order.total) - newAmountPaid;

      // Check for duplicate payment
      const existingPaymentLog = await tx.paymentLog.findFirst({
        where: {
          orderId: order.id,
          transactionId: transactionData!.transaction_id,
        }
      });

      if (existingPaymentLog) {
        return {
          order,
          paymentLog: existingPaymentLog,
          isFullyPaid: newRemainingBalance <= 0
        };
      }

      // Create payment log
      paymentLog = await tx.paymentLog.create({
        data: {
          orderId: order.id,
          amount: paidAmount,
          paymentProvider: 'MIDTRANS',
          paymentMethod: mapMidtransPaymentType(transactionData!.payment_type),
          transactionId: transactionData!.transaction_id,
          notes: `Midtrans: ${transactionData!.transaction_status}`,
          paidAt: transactionData!.settlement_time 
            ? new Date(transactionData!.settlement_time) 
            : new Date(transactionData!.transaction_time),
        }
      });

      updateData.amountPaid = newAmountPaid;
      updateData.remainingBalance = Math.max(0, newRemainingBalance);

      const wasNotFullyPaid = Number(order.remainingBalance) > 0;
      isFullyPaid = newRemainingBalance <= 0;

      // Update status based on payment completion
      if (isFullyPaid) {
        updateData.status = order.status === 'READY_TO_SHIP' ? 'READY_TO_SHIP' : 'PROCESSING';
      } else if (order.status === 'PENDING_PAYMENT') {
        updateData.status = 'PROCESSING';
      }

      // Clear currentPaymentId after successful payment
      updateData.currentPaymentId = null;

      // Update missions and statistics when order is fully paid
      if (isFullyPaid && wasNotFullyPaid) {
        await updateUserStatistics(tx, order.userId, Number(order.total));
        await updateUserMissions(tx, order.userId, Number(order.total));

        if (order.referrerId && Number(order.affiliateCommission) > 0) {
          await updateReferrerStatistics(tx, order.referrerId, Number(order.affiliateCommission));
          await updateReferrerMissions(tx, order.referrerId, Number(order.affiliateCommission));
        }
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: updateData,
    });

    return { order: updatedOrder, paymentLog, isFullyPaid };
  });

  // If orderInclude specified, refetch with relations
  if (orderInclude) {
    const orderWithRelations = await prisma.order.findFirst({
      where: { id: order.id },
      include: orderInclude,
    });
    return { ...result, order: orderWithRelations!, updated: true };
  }

  return { ...result, updated: true };
}
