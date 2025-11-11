/**
 * Project File Upload Utility
 * Handles uploading project attachment files to the server
 */

/**
 * Upload project attachment files to the server
 * @param files - Array of File objects to upload
 * @returns Promise<string[]> - Array of file paths returned from the server
 * @throws Error if upload fails
 */
export async function uploadProjectFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // Create FormData with all files
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Upload files to API
    const response = await fetch('/api/projects/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Upload failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.paths || [];
  } catch (error) {
    console.error('Error uploading project files:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to upload files. Please try again.');
  }
}

