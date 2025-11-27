import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function getBrandsHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const brands = await prisma.brand.findMany({
      where: { enabled: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(
      { success: true, message: 'Brands retrieved', data: brands },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve brands', error: error.message },
      { status: 500 }
    );
  }
}

async function createBrandHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, slug, logoUrl } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: { name, slug, logoUrl }
    });

    return NextResponse.json(
      { success: true, message: 'Brand created', data: brand },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create brand', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getBrandsHandler);
export const POST = requireAuth(createBrandHandler);
