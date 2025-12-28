import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    if (!categoryId || !productId) {
      return NextResponse.json(
        { success: false, message: 'categoryId and productId are required' },
        { status: 400 }
      );
    }

    // Fetch related products from the same category, excluding the current product
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: parseInt(categoryId, 10),
        id: { not: parseInt(productId, 10) },
        enabled: true,
        isActive: true,
      },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // Shuffle the products array using Fisher-Yates algorithm
    const shuffled = [...relatedProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Take only the requested limit after shuffling
    const limitedProducts = shuffled.slice(0, limit);

    // Generate signed URLs for all product images
    const productsWithSignedUrls = await Promise.all(
      limitedProducts.map(async (product) => {
        if (product.images && product.images.length > 0) {
          const paths = product.images.map(img => img.url);

          try {
            const signedUrls = await createSignedUrls('product_images', paths, 86400);
            
            const imagesWithSignedUrls = product.images.map((img, idx) => ({
              ...img,
              url: signedUrls[idx]?.signedUrl || img.url
            }));

            return {
              ...product,
              images: imagesWithSignedUrls
            };
          } catch (error) {
            console.error('Failed to generate signed URLs for product:', product.id, error);
            return product;
          }
        }
        return product;
      })
    );

    return NextResponse.json(
      { success: true, message: 'Related products retrieved', data: productsWithSignedUrls },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve related products', error: error.message },
      { status: 500 }
    );
  }
}
