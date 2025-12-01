import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSnapToken } from '@/src/utils/payment/midtrans.util';

/**
 * Create Midtrans payment token for an order
 */
async function createPaymentTokenHandler(
  request: NextRequest,
  user: JwtData,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order cannot be paid. Current status: ${order.status}` 
        },
        { status: 400 }
      );
    }

    // Calculate amount to be paid (remaining balance)
    const amountToPay = Number(order.remainingBalance);

    if (amountToPay <= 0) {
      return NextResponse.json(
        { success: false, message: 'Order is already fully paid' },
        { status: 400 }
      );
    }

    // Prepare customer details
    const customerDetails = {
      first_name: order.user.name || 'Customer',
      phone: order.user.phoneNumber,
    };

    // Prepare item details
    const itemDetails = order.orderProducts.map((op) => ({
      id: op.product.sku,
      price: Math.ceil(Number(op.subtotal) / op.quantity),
      quantity: op.quantity,
      name: op.name,
    }));

    // Add discount as a separate item if applicable
    if (Number(order.discount) > 0) {
      itemDetails.push({
        id: 'DISCOUNT',
        price: -Math.ceil(Number(order.discount)),
        quantity: 1,
        name: `Discount ${order.discountPercentage}%`,
      });
    }

    // Create Midtrans Snap token
    const snapResponse = await createSnapToken({
      orderId: orderNumber,
      amount: amountToPay,
      customerDetails,
      itemDetails,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment token created successfully',
        data: {
          token: snapResponse.token,
          redirectUrl: snapResponse.redirect_url,
          orderNumber: orderNumber,
          amount: amountToPay,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Create payment token error:', error);
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
