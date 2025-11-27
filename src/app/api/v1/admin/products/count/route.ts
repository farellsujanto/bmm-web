import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function getProductsCountHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const count = await prisma.product.count({
      where: { enabled: true }
    });

    return NextResponse.json(
      { success: true, message: 'Count retrieved', data: count },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to get count', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getProductsCountHandler);
