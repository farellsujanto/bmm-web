import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import prisma from '@/src/utils/database/prismaOrm.util';
import { createSignedUrls, uploadImageToSupabase, deleteImagesFromSupabase } from '@/src/utils/storage/supabaseStorage.util';
import { extractStoragePathFromSignedUrl } from '@/src/utils/formatter/stringFormatter.util';

async function getProductHandler(
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
      const paths = product.images.map(img => img.url); // url column contains storage path

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
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }

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

    // Get existing product to compare images
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: { images: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Get existing image paths (for images that weren't changed)
    const keptImagePaths = formData.getAll('existingImagePaths') as string[];
    
    // Upload new images to Supabase
    const uploadedImages: { url: string; alt: string; sortOrder: number }[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    // Add existing images first (maintaining their order)
    keptImagePaths.forEach((path, index) => {
      if (path) {
        // Extract storage path if it's a full URL (signed URL), otherwise use as-is
        const storagePath = path.includes('supabase.co') 
          ? extractStoragePathFromSignedUrl(path, 'product_images')
          : path;
        
        uploadedImages.push({
          url: storagePath, // Store path directly
          alt: name,
          sortOrder: index
        });
      }
    });
    
    // Upload new images
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
          sortOrder: keptImagePaths.length + i
        });
      }
    }

    // Check if images have changed (paths added/removed, not just reordered)
    const existingImagePaths = new Set(existingProduct.images.map(img => img.url));
    console.log('Existing Image Paths:', existingImagePaths);
    const newImagePaths = new Set(uploadedImages.map(img => img.url));
    console.log('New Image Paths:', newImagePaths);
    
    // Find images that were deleted (exist in old but not in new)
    const imagesToDelete = existingProduct.images.filter(
      img => !newImagePaths.has(img.url)
    );
    console.log('Images to Delete:', imagesToDelete);

    
    // Find images that were added (exist in new but not in old)
    const imagesAdded = uploadedImages.filter(
      img => !existingImagePaths.has(img.url)
    );
    console.log('Images Added:', imagesAdded);
    
    // Images have structurally changed if any were added or deleted
    const imagesChanged = imagesToDelete.length > 0 || imagesAdded.length > 0;
    
    // Check if order changed (even if no adds/deletes)
    const existingOrder = existingProduct.images.map(img => img.url).join(',');
    const newOrder = uploadedImages.map(img => img.url).join(',');
    const orderChanged = existingOrder !== newOrder;

    // Delete removed images from Supabase Storage
    if (imagesToDelete.length > 0) {
      try {
        const pathsToDelete = imagesToDelete.map(img => img.url); // url column contains path
        await deleteImagesFromSupabase('product_images', pathsToDelete);
      } catch (error) {
        console.error('Failed to delete images from storage:', error);
        // Continue even if storage deletion fails
      }
    }

    // Update images in database if they changed or were reordered
    if (imagesChanged || orderChanged) {
      // Delete all existing images from database
      await prisma.productImage.deleteMany({
        where: { productId: parseInt(params.id) }
      });
    }

    // Update product with new data
    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
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
        affiliatePercent: affiliatePercent ? parseFloat(affiliatePercent) : null,
        isPreOrder,
        preOrderReadyEarliest: preOrderReadyEarliest ? parseInt(preOrderReadyEarliest) : null,
        preOrderReadyLatest: preOrderReadyLatest ? parseInt(preOrderReadyLatest) : null,
        brandId: parseInt(brandId),
        categoryId: parseInt(categoryId),
        // Create new images if there are any (including when all images were deleted)
        images: imagesChanged ? (uploadedImages.length > 0 ? {
          create: uploadedImages
        } : undefined) : undefined
      },
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
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: error.message },
      { status: 500 }
    );
  }
}

async function deleteProductHandler(
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
