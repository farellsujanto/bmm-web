import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadImageOptions {
  bucket: string;
  folder?: string;
  file: File | Buffer;
  filename?: string;
  contentType?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface UploadImageResult {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Upload an image to Supabase Storage with optional resizing
 * @param options Upload configuration options
 * @returns Upload result with URLs
 */
export async function uploadImageToSupabase(
  options: UploadImageOptions
): Promise<UploadImageResult> {
  const {
    bucket,
    folder = '',
    file,
    filename,
    contentType = 'image/webp',
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
  } = options;

  let buffer: Buffer;

  // Convert File to Buffer if needed
  if (file instanceof File) {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } else {
    buffer = file;
  }

  // Process image with sharp
  const sharp = (await import('sharp')).default;
  const processedBuffer = await sharp(buffer)
    .webp({ quality })
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  // Generate filename if not provided
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const finalFilename = filename || `${timestamp}-${randomString}.webp`;

  // Create full path
  const path = folder ? `${folder}/${finalFilename}` : finalFilename;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, processedBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Delete an image from Supabase Storage
 * @param bucket Storage bucket name
 * @param path Path to the file in storage
 */
export async function deleteImageFromSupabase(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete multiple images from Supabase Storage
 * @param bucket Storage bucket name
 * @param paths Array of paths to delete
 */
export async function deleteImagesFromSupabase(
  bucket: string,
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

/**
 * List files in a Supabase Storage bucket folder
 * @param bucket Storage bucket name
 * @param folder Folder path (optional)
 */
export async function listFilesInSupabase(
  bucket: string,
  folder?: string
): Promise<any[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data;
}

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket Storage bucket name
 * @param path Path to the file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export default supabase;
