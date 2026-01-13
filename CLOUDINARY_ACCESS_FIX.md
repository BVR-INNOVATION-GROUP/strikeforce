# Cloudinary File Access Configuration Guide

If you're experiencing "File access denied" or "Customer is marked as untrusted" errors, follow these steps to ensure all files are publicly accessible.

## Quick Fix Checklist

### 1. Enable PDF and ZIP File Delivery

Cloudinary blocks PDF and ZIP files by default for security reasons. You must enable delivery:

1. Log in to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to **Settings** → **Security**
3. Scroll down to **"PDF and ZIP files delivery"** section
4. Check the box **"Allow delivery of PDF and ZIP files"**
5. Click **Save** at the bottom of the page

### 2. Configure Upload Preset for Public Access

Your upload preset must be configured to make files public:

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click on your upload preset (or create a new one)
4. Ensure the following settings:
   - **Signing mode**: **Unsigned** (required for client-side uploads)
   - **Access mode**: **Public** ⚠️ **This is critical!**
   - **Allowed formats**: Include all formats you need (images, PDFs, etc.)
5. Click **Save**

### 3. Verify Existing Files

For files that were already uploaded before fixing the settings:

1. Go to **Media Library** in Cloudinary dashboard
2. Find the file that's giving access errors
3. Click on the file to open details
4. Check the **Access mode** - it should be **Public**
5. If it's not public:
   - Click **Edit** or **Manage**
   - Change **Access mode** to **Public**
   - Save changes

### 4. Test File Access

After making changes:

1. Try accessing the file URL directly in a browser
2. The URL should load/download the file without errors
3. If you still get errors, wait a few minutes for Cloudinary to propagate the changes

## Common Issues and Solutions

### Issue: "Customer is marked as untrusted"
**Solution**: Enable PDF/ZIP delivery in Security settings (Step 1 above)

### Issue: "File access denied" for images
**Solution**: Check upload preset Access mode is set to Public (Step 2 above)

### Issue: Old files still not accessible
**Solution**: Either re-upload the files, or manually change their access mode in Media Library (Step 3 above)

### Issue: New uploads work but old ones don't
**Solution**: This means your upload preset is now correct, but old files need their access mode updated manually

## Verification

To verify your configuration is correct:

1. **Upload Preset**:
   - Settings → Upload → Your preset → Access mode = **Public** ✅

2. **Security Settings**:
   - Settings → Security → "Allow delivery of PDF and ZIP files" = **Checked** ✅

3. **Test Upload**:
   - Upload a new file through your application
   - Try accessing the returned URL directly
   - Should work without errors ✅

## Need Help?

If issues persist after following these steps:
- Check Cloudinary console for specific error messages
- Verify your environment variables are set correctly
- Check browser console for client-side errors
- Review Cloudinary documentation: https://cloudinary.com/documentation










