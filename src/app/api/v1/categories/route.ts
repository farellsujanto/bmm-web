import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(
      { success: true, message: 'Categories retrieved', data: categories },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve categories', error: error.message },
      { status: 500 }
    );
  }
}
