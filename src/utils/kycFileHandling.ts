/**
 * KYC File Handling Utilities
 */

/**
 * Validate KYC file (size and type)
 */
export function validateKYCFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PDF and image files are allowed" };
  }

  return { valid: true };
}

/**
 * Upload file and return URL (in production, upload to storage first)
 */
export async function uploadKYCFile(file: File): Promise<string> {
  // In production, upload to storage (S3, etc.) and return URL
  // For demo, create object URL
  return URL.createObjectURL(file); // In production: await uploadToStorage(file)
}





