import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import { uploadImageToSupabase } from '@/src/utils/storage/supabaseStorage.util';

async function uploadImageHandler(request: NextRequest, user: JwtData) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Upload to Supabase
    const result = await uploadImageToSupabase({
      bucket: 'product_images',
      folder: 'temp', // Temporary folder for ad-hoc uploads during editing
      file: file,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 85
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Image uploaded successfully',
        data: { url: result.publicUrl }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image', error: error.message },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(uploadImageHandler);
