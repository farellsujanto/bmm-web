import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function updateCategoryHandler(
  request: NextRequest,
  user: JwtData,
  context?: { params: Promise<{ id: string }> }
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
        { success: false, message: 'Category ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const category = await prisma.category.update({
      where: { id: parseInt(params.id) },
      data: body
    });

    return NextResponse.json(
      { success: true, message: 'Category updated', data: category },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update category', error: error.message },
      { status: 500 }
    );
  }
}

async function deleteCategoryHandler(
  request: NextRequest,
  user: JwtData,
  context?: { params: Promise<{ id: string }> }
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
        { success: false, message: 'Category ID required' },
        { status: 400 }
      );
    }

    await prisma.category.update({
      where: { id: parseInt(params.id) },
      data: { enabled: false }
    });

    return NextResponse.json(
      { success: true, message: 'Category deleted' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: error.message },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(updateCategoryHandler);
export const PATCH = requireAuth(deleteCategoryHandler);
