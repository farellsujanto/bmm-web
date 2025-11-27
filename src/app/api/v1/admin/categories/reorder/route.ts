import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function reorderCategoriesHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { items } = body; // Array of { id, sortOrder }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: 'Items array is required' },
        { status: 400 }
      );
    }

    // Update all categories with new sort orders
    await Promise.all(
      items.map((item: { id: number; sortOrder: number }) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    return NextResponse.json(
      { success: true, message: 'Categories reordered successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to reorder categories', error: error.message },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(reorderCategoriesHandler);
