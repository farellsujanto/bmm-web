import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

// GET - List all product requests
async function getProductRequestsHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const productRequests = await prisma.productRequest.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { success: true, data: productRequests },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Failed to fetch product requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product requests', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getProductRequestsHandler);
