import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { uploadImageToSupabase, createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

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

    // Generate signed URLs for all product images
    const productsWithSignedUrls = await Promise.all(
      products.map(async (product) => {
        if (product.images && product.images.length > 0) {
          // Use storage paths directly from database
          const paths = product.images.map(img => img.url);

          try {
            // Generate signed URLs (valid for 24 hours)
            const signedUrls = await createSignedUrls('product_images', paths, 86400);
            
            // Map signed URLs back to images
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
            return product; // Return original if signed URL generation fails
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

async function createProductHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const sku = formData.get('sku') as string;
    const description = formData.get('description') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const dataSheetUrl = formData.get('dataSheetUrl') as string;
    const price = formData.get('price') as string;
    const discount = formData.get('discount') as string;
    const stock = formData.get('stock') as string;
    const isActive = formData.get('isActive') === 'true';
    const affiliatePercent = formData.get('affiliatePercent') as string;
    const isPreOrder = formData.get('isPreOrder') === 'true';
    const preOrderReadyEarliest = formData.get('preOrderReadyEarliest') as string;
    const preOrderReadyLatest = formData.get('preOrderReadyLatest') as string;
    const brandId = formData.get('brandId') as string;
    const categoryId = formData.get('categoryId') as string;

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

    // Upload images to Supabase
    const uploadedImages: { url: string; alt: string; sortOrder: number }[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const result = await uploadImageToSupabase({
          bucket: 'product_images',
          folder: slug,
          file: file,
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 85
        });
        
        uploadedImages.push({
          url: result.path, // Store path instead of full URL
          alt: name,
          sortOrder: i
        });
      }
    }

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
        isActive,
        sortOrder: nextSortOrder,
        affiliatePercent: affiliatePercent ? parseFloat(affiliatePercent) : null,
        isPreOrder,
        preOrderReadyEarliest: preOrderReadyEarliest ? parseInt(preOrderReadyEarliest) : null,
        preOrderReadyLatest: preOrderReadyLatest ? parseInt(preOrderReadyLatest) : null,
        brandId: parseInt(brandId),
        categoryId: parseInt(categoryId),
        images: uploadedImages.length > 0 ? {
          create: uploadedImages
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
