import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

/**
 * Get user order history
 */
async function getOrdersHandler(request: NextRequest, user: JwtData) {
  try {
    const orders = await prisma.order.findMany({
      where: { 
        userId: user.id,
        enabled: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        orderProducts: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    // Generate signed URLs for product images
    const ordersWithSignedUrls = await Promise.all(
      orders.map(async (order) => {
        const productsWithSignedUrls = await Promise.all(
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
        );

        return {
          ...order,
          orderProducts: productsWithSignedUrls
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Orders retrieved successfully',
        data: ordersWithSignedUrls
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve orders',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrdersHandler);
