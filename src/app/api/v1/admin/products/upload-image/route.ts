import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/utils/security/apiGuard.util';
import { JwtData } from '@/src/utils/security/models/jwt.model';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}.webp`;

    // Define upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert to WebP and save
    const filepath = join(uploadDir, filename);
    await sharp(buffer)
      .webp({ quality: 85 })
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFile(filepath);

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Image uploaded successfully',
        data: { url: publicUrl }
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
