import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSnapToken, checkTransactionStatus } from '@/src/utils/payment/midtrans.util';

/**
 * Create Midtrans payment token for an order
 */
async function createPaymentTokenHandler(
  request: NextRequest,
  user: JwtData,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Validate Midtrans configuration
    if (!process.env.MIDTRANS_SERVER_KEY) {
      console.error('MIDTRANS_SERVER_KEY is not configured');
      return NextResponse.json(
        { success: false, message: 'Payment gateway is not properly configured' },
        { status: 500 }
      );
    }

    const params = await context.params;
    const orderNumber = params.id;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Invalid order number' },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        userId: user.id, // Only allow users to pay for their own orders
        enabled: true
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        },
        user: true,
        companyOrder: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is in a payable status
    // Allow payment for PENDING_PAYMENT (DP/full payment) and READY_TO_SHIP (clearance)
    if (order.status !== 'PENDING_PAYMENT' && order.status !== 'READY_TO_SHIP' && order.status !== 'PROCESSING') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order cannot be paid. Current status: ${order.status}` 
        },
        { status: 400 }
      );
    }

    // Calculate amount to be paid (remaining balance)
    const remainingBalance = Number(order.remainingBalance);
    const totalAmount = Number(order.total);
    const amountPaid = Number(order.amountPaid);

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { success: false, message: 'Order is already fully paid' },
        { status: 400 }
      );
    }

    // Determine payment type and amount
    let amountToPay: number;
    let paymentType: 'DP' | 'FULL' | 'CLEARANCE';
    let transactionId: string;

    if (amountPaid === 0) {
      // First payment - check if DP is required
      const requiresDP = order.orderProducts.some(op => {
        return Number(op.downpaymentPercentage) > 0 && Number(op.downpaymentPercentage) < 100;
      });

      if (requiresDP) {
        // Calculate DP amount (use highest DP percentage from products)
        const maxDPPercentage = Math.max(
          ...order.orderProducts.map(op => Number(op.downpaymentPercentage))
        );
        amountToPay = Math.ceil(totalAmount * (maxDPPercentage / 100));
        paymentType = 'DP';
        transactionId = `${orderNumber}-DP`;
      } else {
        // Full payment required
        amountToPay = remainingBalance;
        paymentType = 'FULL';
        transactionId = `${orderNumber}-FULL`;
      }
    } else {
      // Subsequent payment - clearance
      amountToPay = remainingBalance;
      paymentType = 'CLEARANCE';
      transactionId = `${orderNumber}-CLEARANCE-${Date.now()}`;
    }

    // Check if there's an existing active transaction for this payment
    // If the transaction exists and is still pending, we can reuse the token
    
    try {
      const existingTransaction = await checkTransactionStatus(transactionId);
      
      if (existingTransaction) {
        const status = existingTransaction.transaction_status;
        
        // If transaction is still pending/active, user can continue with it
        if (status === 'pending' || status === 'authorize') {
          console.log(`Reusing existing pending transaction: ${transactionId}`);
          // Transaction still active, but we need to create a new token
          // Midtrans doesn't allow reusing tokens, so we'll create a new one with a slight variation
          if (paymentType === 'CLEARANCE') {
            // Add a retry suffix for clearance payments
            transactionId = `${orderNumber}-CLEARANCE-${Date.now()}`;
          } else {
            // For DP/FULL, add a retry counter
            transactionId = `${transactionId}-${Date.now()}`;
          }
        }
        
        // If transaction is completed (settlement/capture), don't create a new one
        if (status === 'settlement' || status === 'capture') {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Payment for this stage has already been completed. Please refresh the page.' 
            },
            { status: 400 }
          );
        }
        
        // If transaction failed/expired, we can create a new one with the same ID pattern
        if (status === 'deny' || status === 'cancel' || status === 'expire' || status === 'failure') {
          console.log(`Previous transaction ${transactionId} failed/expired, creating new one`);
          // Add timestamp to create a new unique transaction
          if (paymentType === 'DP') {
            transactionId = `${orderNumber}-DP-${Date.now()}`;
          } else if (paymentType === 'FULL') {
            transactionId = `${orderNumber}-FULL-${Date.now()}`;
          }
          // CLEARANCE already has timestamp
        }
      }
    } catch (error) {
      // Transaction doesn't exist yet, which is fine - we'll create a new one
      console.log(`No existing transaction found for ${transactionId}, creating new one`);
    }

    // Prepare customer details
    const customerDetails = {
      first_name: order.user.name || 'Customer',
      phone: order.user.phoneNumber,
    };

    // Prepare item details based on payment type
    const itemDetails: any[] = [];
    
    if (paymentType === 'DP') {
      // For DP, create a single line item
      const dpPercentage = (amountToPay / totalAmount) * 100;
      itemDetails.push({
        id: orderNumber,
        price: Math.ceil(amountToPay),
        quantity: 1,
        name: `Down Payment (${dpPercentage.toFixed(0)}%) - Order ${orderNumber}`,
      });
    } else if (paymentType === 'CLEARANCE') {
      // For clearance, create a single line item
      itemDetails.push({
        id: orderNumber,
        price: Math.ceil(amountToPay),
        quantity: 1,
        name: `Remaining Payment - Order ${orderNumber}`,
      });
    } else {
      // For full payment, list all products with their prices after product discount
      order.orderProducts.forEach((op) => {
        // Price already includes product discount (stored in database as priceAfterDiscount)
        const priceAfterProductDiscount = Number(op.price) * (1 - Number(op.discount) / 100);
        itemDetails.push({
          id: op.product.sku,
          price: Math.ceil(priceAfterProductDiscount),
          quantity: op.quantity,
          name: op.name,
        });
      });

      // Add global discount as a separate line item if applicable
      // This discount is applied to the subtotal (which already includes product discounts)
      if (Number(order.discount) > 0) {
        itemDetails.push({
          id: 'GLOBAL_DISCOUNT',
          price: -Math.ceil(Number(order.discount)),
          quantity: 1,
          name: `Global Discount (${Number(order.discountPercentage).toFixed(1)}%)`,
        });
      }
    }

    // Create Midtrans Snap token with unique transaction ID
    console.log('Creating Midtrans token:', {
      transactionId,
      amount: amountToPay,
      paymentType,
      orderNumber
    });

    const snapResponse = await createSnapToken({
      orderId: transactionId,
      amount: amountToPay,
      customerDetails,
      itemDetails,
    });

    console.log('Midtrans token created successfully:', transactionId);

    return NextResponse.json(
      {
        success: true,
        message: 'Payment token created successfully',
        data: {
          token: snapResponse.token,
          redirectUrl: snapResponse.redirect_url,
          orderNumber: orderNumber,
          transactionId: transactionId,
          amount: amountToPay,
          paymentType: paymentType,
          totalAmount: totalAmount,
          amountPaid: amountPaid,
          remainingBalance: remainingBalance,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Create payment token error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      orderNumber: (await context.params).id
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create payment token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createPaymentTokenHandler);
