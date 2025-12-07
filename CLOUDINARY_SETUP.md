# Cloudinary Setup Guide

This project uses Cloudinary for client-side file uploads. All file uploads (logos, profile pictures, application attachments, project files) are now handled directly from the client to Cloudinary, and only the URLs are saved to the backend.

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (or use an existing account)
3. Once logged in, you'll see your **Cloud Name** in the dashboard

### 2. Create an Upload Preset

1. In the Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `strikeforce_unsigned`)
   - **Signing mode**: Select **Unsigned** (required for client-side uploads)
   - **Folder**: Optional - you can set a default folder (e.g., `strikeforce`)
   - **Allowed formats**: Select the formats you want to allow
   - **Max file size**: Set appropriate limits (e.g., 10MB)
   - **Use filename**: Enable if you want to preserve original filenames
   - **Unique filename**: Enable to prevent filename conflicts
5. Click **Save**

### 3. Configure Environment Variables

Add the following environment variables to your `.env.local` file (or your deployment environment):

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client-side code.

### 4. Example `.env.local` File

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=my-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=strikeforce_unsigned
```

## File Upload Utilities

The following utilities are available for different types of uploads:

### Application Files
```typescript
import { uploadApplicationFiles } from "@/src/utils/applicationFileUpload";

const urls = await uploadApplicationFiles(files);
// Returns: string[] - Array of Cloudinary URLs
```

### Project Files
```typescript
import { uploadProjectFiles } from "@/src/utils/projectFileUpload";

const urls = await uploadProjectFiles(files);
// Returns: string[] - Array of Cloudinary URLs
```

### Organization Logos
```typescript
import { uploadOrganizationLogo } from "@/src/utils/organizationLogoUpload";

const url = await uploadOrganizationLogo(file, organizationId?);
// Returns: string - Cloudinary URL
// Optimized to 800x800px, quality: auto:good
```

### Profile Pictures
```typescript
import { uploadProfilePicture } from "@/src/utils/profilePictureUpload";

const url = await uploadProfilePicture(file, userId?);
// Returns: string - Cloudinary URL
// Optimized to 400x400px, quality: auto:good
```

## Folder Structure

Files are organized in Cloudinary with the following folder structure:

- `strikeforce/applications/` - Application attachments
- `strikeforce/projects/` - Project files
- `strikeforce/organizations/{orgId}/logos/` - Organization logos
- `strikeforce/profiles/{userId}/` - User profile pictures

## Security Considerations

1. **Upload Preset**: Use an **unsigned** upload preset for client-side uploads. This allows uploads without exposing your API secret.

2. **File Validation**: The utilities validate:
   - File types (images: JPEG, PNG, GIF, WebP)
   - File sizes (max 5MB for images)
   - File formats

3. **Backend Storage**: The backend now only stores Cloudinary URLs, not the actual files. This reduces server storage and bandwidth.

4. **File Deletion**: File deletion from Cloudinary should be handled on the backend using the Admin API (requires API secret, which should never be exposed to the client).

## Troubleshooting

### Error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set"
- Make sure you've added the environment variable to `.env.local`
- Restart your Next.js development server after adding environment variables

### Error: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is required"
- Create an upload preset in your Cloudinary dashboard
- Make sure it's set to **Unsigned** mode
- Add the preset name to your environment variables

### Upload Fails with 401/403
- Check that your upload preset is set to **Unsigned**
- Verify your Cloud Name is correct
- Check Cloudinary dashboard for any restrictions on the upload preset

### Files Not Appearing in Cloudinary
- Check the Cloudinary Media Library
- Verify the folder structure matches what's configured
- Check browser console for any error messages

## Migration Notes

If you're migrating from backend file uploads:

1. Existing files stored on the backend will continue to work (URLs are preserved)
2. New uploads will go directly to Cloudinary
3. You may want to migrate existing files to Cloudinary for consistency
4. Update backend endpoints to accept URLs instead of handling file uploads

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Unsigned Upload Presets](https://cloudinary.com/documentation/upload_images#unsigned_upload)

