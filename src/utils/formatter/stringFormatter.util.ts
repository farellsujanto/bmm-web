import phone from 'phone';

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
  const year = date.getFullYear(); // Get full year

  return `${day}-${month}-${year}`; // Return formatted date
}

export function formatPhoneNumber(phoneNumber: string): string {
  const formatted = phone(phoneNumber, { country: 'ID' }); // Format phone number for Indonesia
  if (!formatted.isValid) {
    throw new Error('Invalid phone number format'); // Throw error if phone number is invalid
  }
  // Return the formatted phone number or the original if formatting fails
  return formatted.phoneNumber;
}


export const maskPhoneNumber = (phone: string): string => {
  if (phone.length <= 4) return phone;
  const start = phone.substring(0, 7); // +62xxx
  const end = phone.substring(phone.length - 4); // last 4 digits
  return `${start}****${end}`;
}

/**
 * Extract storage path from Supabase signed URL
 * @param signedUrl - Full Supabase signed URL
 * @param bucketName - Storage bucket name (e.g., "product_images")
 * @returns Storage path (e.g., "folder/file.webp")
 * @example
 * extractStoragePathFromSignedUrl("https://...supabase.co/.../product_images/asdasd/file.webp?token=...", "product_images")
 * // Returns: "asdasd/file.webp"
 */
export const extractStoragePathFromSignedUrl = (signedUrl: string, bucketName: string): string => {
  try {
    const url = new URL(signedUrl);
    // Extract path after bucket name (e.g., /storage/v1/object/sign/{bucketName}/...)
    const pathMatch = url.pathname.match(new RegExp(`\\/${bucketName}\\/(.+)$`));
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    // Fallback: return original if pattern doesn't match
    return signedUrl;
  } catch (error) {
    // If URL parsing fails, return original
    return signedUrl;
  }
}