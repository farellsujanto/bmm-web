import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    // If slug is provided, return single product
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug, enabled: true, isActive: true },
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
        const paths = product.images.map(img => img.url);

        try {
          const signedUrls = await createSignedUrls('product_images', paths, 86400);
          
          const imagesWithSignedUrls = product.images.map((img, idx) => ({
            ...img,
            url: signedUrls[idx]?.signedUrl || img.url
          }));

          return NextResponse.json(
            { success: true, message: 'Product retrieved', data: { ...product, images: imagesWithSignedUrls } },
            { status: 200 }
          );
        } catch (error) {
          console.error('Failed to generate signed URLs for product:', product.id, error);
          return NextResponse.json(
            { success: true, message: 'Product retrieved', data: product },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        { success: true, message: 'Product retrieved', data: product },
        { status: 200 }
      );
    }

    const where: any = {
      enabled: true,
      isActive: true,
    };

    if (categorySlug && categorySlug !== 'Semua') {
      where.category = {
        slug: categorySlug.toLowerCase()
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Generate signed URLs for all product images
    const productsWithSignedUrls = await Promise.all(
      products.map(async (product) => {
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
      { success: true, message: 'Products retrieved', data: productsWithSignedUrls },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products', error: error.message },
      { status: 500 }
    );
  }
}
