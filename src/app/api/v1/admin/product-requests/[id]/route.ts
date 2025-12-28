import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// PATCH - Update product request status
async function updateProductRequestHandler(
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
    const { status, adminNotes, quotedPrice } = await request.json();
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const updatedRequest = await prisma.productRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        products: true,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to update product request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product request', error: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = requireAuth(updateProductRequestHandler);
