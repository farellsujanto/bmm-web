import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function updateBrandHandler(
  request: NextRequest,
  user: JwtData,
  context?: { params: { id: string } }
) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const params = await context?.params;
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Brand ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const brand = await prisma.brand.update({
      where: { id: parseInt(params.id) },
      data: body
    });

    return NextResponse.json(
      { success: true, message: 'Brand updated', data: brand },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update brand', error: error.message },
      { status: 500 }
    );
  }
}

async function deleteBrandHandler(
  request: NextRequest,
  user: JwtData,
  context?: { params: { id: string } }
) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const params = await context?.params;
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Brand ID required' },
        { status: 400 }
      );
    }

    await prisma.brand.update({
      where: { id: parseInt(params.id) },
      data: { enabled: false }
    });

    return NextResponse.json(
      { success: true, message: 'Brand deleted' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete brand', error: error.message },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(updateBrandHandler);
export const PATCH = requireAuth(deleteBrandHandler);
