import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// GET - List all orders
async function getOrdersHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            address: true,
          },
        },
        orderProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
        companyOrder: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getOrdersHandler);
