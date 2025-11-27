import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import { createSignedUrl, createSignedUrls } from '@/src/utils/storage/supabaseStorage.util';

/**
 * Generate temporary signed URLs for product images
 * Useful for private/protected content that needs temporary access
 */
async function getSignedUrlHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const paths = searchParams.get('paths'); // Comma-separated paths
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600'); // Default 1 hour

    if (!path && !paths) {
      return NextResponse.json(
        { success: false, message: 'Path or paths parameter is required' },
        { status: 400 }
      );
    }

    // Single URL
    if (path) {
      const signedUrl = await createSignedUrl('product_images', path, expiresIn);
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Signed URL generated',
          data: { signedUrl, expiresIn }
        },
        { status: 200 }
      );
    }

    // Multiple URLs
    if (paths) {
      const pathArray = paths.split(',').map(p => p.trim());
      const signedUrls = await createSignedUrls('product_images', pathArray, expiresIn);
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Signed URLs generated',
          data: { signedUrls, expiresIn }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate signed URL', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getSignedUrlHandler);
