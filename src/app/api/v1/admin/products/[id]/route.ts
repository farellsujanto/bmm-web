import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

async function getProductHandler(
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
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id), enabled: true },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate signed URLs for product images
    if (product.images && product.images.length > 0) {
      const paths = product.images.map(img => {
        const url = new URL(img.url);
        const pathParts = url.pathname.split('/product_images/');
        return pathParts[1] || img.url;
      });

      try {
        const signedUrls = await createSignedUrls('product_images', paths, 86400);
        product.images = product.images.map((img, idx) => ({
          ...img,
          url: signedUrls[idx]?.signedUrl || img.url
        }));
      } catch (error) {
        console.error('Failed to generate signed URLs:', error);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Product retrieved', data: product },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve product', error: error.message },
      { status: 500 }
    );
  }
}

async function updateProductHandler(
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
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { images, ...updateData } = body;

    // Convert price to integer if provided
    if (updateData.price) {
      updateData.price = parseInt(updateData.price);
    }

    // Convert stock to integer if provided
    if (updateData.stock) {
      updateData.stock = parseInt(updateData.stock);
    }

    // Convert decimal fields
    if (updateData.discount) {
      updateData.discount = parseFloat(updateData.discount);
    }
    if (updateData.affiliatePercent) {
      updateData.affiliatePercent = parseFloat(updateData.affiliatePercent);
    }

    // Convert IDs to integers
    if (updateData.brandId) updateData.brandId = parseInt(updateData.brandId);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);

    // Handle date fields - now they are integers (weeks)
    if (updateData.preOrderReadyEarliest) {
      updateData.preOrderReadyEarliest = parseInt(updateData.preOrderReadyEarliest);
    }
    if (updateData.preOrderReadyLatest) {
      updateData.preOrderReadyLatest = parseInt(updateData.preOrderReadyLatest);
    }

    // Handle images if provided
    if (images) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: parseInt(params.id) }
      });

      // Add new images
      updateData.images = {
        create: images.map((img: any, index: number) => ({
          url: img.url,
          alt: img.alt || '',
          sortOrder: img.sortOrder || index
        }))
      };
    }

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        brand: true,
        category: true,
        images: true
      }
    });

    return NextResponse.json(
      { success: true, message: 'Product updated', data: product },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

async function deleteProductHandler(
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
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: { enabled: false }
    });

    return NextResponse.json(
      { success: true, message: 'Product deleted' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getProductHandler);
export const PUT = requireAuth(updateProductHandler);
export const PATCH = requireAuth(deleteProductHandler);
