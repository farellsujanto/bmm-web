import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// PATCH - Update order status
async function updateOrderHandler(
  request: NextRequest,
  user: JwtData,
  { params }: { params: Promise<{ id: string }> }
) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const { status } = await request.json();
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order', error: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(updateOrderHandler);
