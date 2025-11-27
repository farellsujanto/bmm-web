import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
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
    console.error('Supabase upload error:', error);
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

/**
 * Generate a temporary signed URL for a file in Supabase Storage
 * @param bucket Storage bucket name
 * @param path Path to the file
 * @param expiresIn Time in seconds until the URL expires (default: 3600 = 1 hour)
 * @returns Signed URL that expires after the specified time
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Generate multiple temporary signed URLs for files in Supabase Storage
 * @param bucket Storage bucket name
 * @param paths Array of paths to the files
 * @param expiresIn Time in seconds until the URLs expire (default: 3600 = 1 hour)
 * @returns Array of signed URLs
 */
export async function createSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<{ path: string; signedUrl: string }[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URLs: ${error.message}`);
  }

  return data.map((item) => ({
    path: item.path!,
    signedUrl: item.signedUrl!,
  }));
}

export default supabase;
