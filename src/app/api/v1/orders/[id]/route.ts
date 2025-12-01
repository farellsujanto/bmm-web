import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';
import { checkTransactionStatus, mapMidtransStatusToOrderStatus, mapMidtransPaymentType } from '@/src/utils/payment/midtrans.util';

/**
 * Get order by order number
 */
async function getOrderHandler(
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

    let order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        userId: user.id, // Only allow users to see their own orders
        enabled: true
      },
      include: {
        orderProducts: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                },
                brand: true,
                category: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            phoneNumber: true,
            address: true,
            governmentId: true
          }
        },
        companyOrder: true,
        paymentLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check and update order status from Midtrans if order is pending payment
    console.log('Current order status:', order.status);
    if (order.status === 'PENDING_PAYMENT') {
      try {
        const transactionData = await checkTransactionStatus(orderNumber);
        
        if (transactionData) {
          const newStatus = mapMidtransStatusToOrderStatus(
            transactionData.transaction_status,
            transactionData.fraud_status
          );
          console.log(transactionData);
          console.log('Mapped new order status:', newStatus);
          
          // If status has changed, update the order in database
          if (newStatus !== order.status) {
            const updateData: any = {
              status: newStatus,
              updatedAt: new Date()
            };

            // If payment is successful, update payment tracking
            if (transactionData.transaction_status === 'settlement' || 
                transactionData.transaction_status === 'capture') {
              const paidAmount = parseFloat(transactionData.gross_amount);
              const newAmountPaid = Number(order.amountPaid) + paidAmount;
              const newRemainingBalance = Number(order.total) - newAmountPaid;

              // Check if payment log already exists for this transaction
              const existingLog = await prisma.paymentLog.findFirst({
                where: {
                  orderId: order.id,
                  transactionId: transactionData.transaction_id
                }
              });

              // Create payment log if it doesn't exist
              if (!existingLog) {
                await prisma.paymentLog.create({
                  data: {
                    orderId: order.id,
                    amount: paidAmount,
                    paymentProvider: 'MIDTRANS',
                    paymentMethod: mapMidtransPaymentType(transactionData.payment_type),
                    transactionId: transactionData.transaction_id,
                    notes: `Midtrans payment: ${transactionData.transaction_status} (${transactionData.fraud_status || 'N/A'})`,
                    paidAt: transactionData.settlement_time 
                      ? new Date(transactionData.settlement_time) 
                      : new Date(transactionData.transaction_time)
                  }
                });

                updateData.amountPaid = newAmountPaid;
                updateData.remainingBalance = newRemainingBalance;

                // If fully paid, update status to PROCESSING if not already in a later stage
                if (newRemainingBalance <= 0 && order.status === 'PENDING_PAYMENT') {
                  updateData.status = 'PROCESSING';
                }
              }
            }

            // Update the order
            const updatedOrder = await prisma.order.update({
              where: { id: order.id },
              data: updateData,
              include: {
                orderProducts: {
                  include: {
                    product: {
                      include: {
                        images: {
                          orderBy: { sortOrder: 'asc' },
                          take: 1
                        },
                        brand: true,
                        category: true
                      }
                    }
                  }
                },
                user: {
                  select: {
                    name: true,
                    phoneNumber: true,
                    address: true,
                    governmentId: true
                  }
                },
                companyOrder: true,
                paymentLogs: {
                  orderBy: { createdAt: 'desc' }
                }
              }
            });

            // Use the updated order for the response
            order = updatedOrder as any;
          }
        }
      } catch (error) {
        // Log error but continue with existing order data
        console.error('Failed to check Midtrans transaction status:', error);
      }
    }

    // Generate signed URLs for product images
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found after status update' },
        { status: 404 }
      );
    }

    const orderWithSignedUrls = {
      ...order,
      orderProducts: await Promise.all(
        order.orderProducts.map(async (orderProduct: any) => {
          if (orderProduct.product.images && orderProduct.product.images.length > 0) {
            const paths = orderProduct.product.images.map((img: any) => img.url);

            try {
              const signedUrls = await createSignedUrls('product_images', paths, 86400);
              
              const imagesWithSignedUrls = orderProduct.product.images.map((img: any, idx: number) => ({
                ...img,
                url: signedUrls[idx]?.signedUrl || img.url
              }));

              return {
                ...orderProduct,
                product: {
                  ...orderProduct.product,
                  images: imagesWithSignedUrls
                }
              };
            } catch (error) {
              console.error('Failed to generate signed URLs for product:', orderProduct.product.id, error);
              return orderProduct;
            }
          }
          return orderProduct;
        })
      )
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Order retrieved successfully',
        data: orderWithSignedUrls
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrderHandler);
