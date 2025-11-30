import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

/**
 * Get order by ID
 */
async function getOrderHandler(
  request: NextRequest,
  user: JwtData,
  context: { params: { id: string } }
) {
  try {
    const orderId = parseInt(context.params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
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
            governmentId: true,
            company: true
          }
        },
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

    // Generate signed URLs for product images
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
