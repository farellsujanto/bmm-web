import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';

async function getProductsHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      where: { enabled: true },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(
      { success: true, message: 'Products retrieved', data: products },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products', error: error.message },
      { status: 500 }
    );
  }
}

async function createProductHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      shortDescription,
      dataSheetUrl,
      price,
      discount,
      stock,
      isActive,
      affiliatePercent,
      isPreOrder,
      preOrderReadyEarliest,
      preOrderReadyLatest,
      brandId,
      categoryId,
      images
    } = body;

    // Validate required fields
    if (!name || !slug || !sku || !brandId || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the highest sort order to append new product at the end
    const maxSortOrder = await prisma.product.findFirst({
      where: { enabled: true },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    });
    const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;

    // Create product with images
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        shortDescription,
        dataSheetUrl,
        price: price ? parseInt(price) : null,
        discount: discount ? parseFloat(discount) : null,
        stock: stock ? parseInt(stock) : 0,
        isActive: isActive !== false,
        sortOrder: nextSortOrder,
        affiliatePercent: affiliatePercent ? parseFloat(affiliatePercent) : null,
        isPreOrder: isPreOrder || false,
        preOrderReadyEarliest: preOrderReadyEarliest ? parseInt(preOrderReadyEarliest) : null,
        preOrderReadyLatest: preOrderReadyLatest ? parseInt(preOrderReadyLatest) : null,
        brandId: parseInt(brandId),
        categoryId: parseInt(categoryId),
        images: images ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || name,
            sortOrder: img.sortOrder || index
          }))
        } : undefined
      },
      include: {
        brand: true,
        category: true,
        images: true
      }
    });

    return NextResponse.json(
      { success: true, message: 'Product created', data: product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getProductsHandler);
export const POST = requireAuth(createProductHandler);
