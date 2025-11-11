/**
 * API Route: POST /api/projects/upload
 * Handles file uploads for project attachments
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * POST /api/projects/upload
 * Upload project attachment files
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate file count (max 10 files per project)
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files allowed per project" },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB per file)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 10MB` },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "projects");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Upload files and generate paths
    const paths: string[] = [];
    for (const file of files) {
      // Generate unique filename using timestamp and random string
      const fileExtension = path.extname(file.name);
      const randomString = Math.random().toString(36).substring(2, 15);
      const uniqueFilename = `${Date.now()}_${randomString}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Convert file to buffer and write
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Return relative path from public directory
      paths.push(`/uploads/projects/${uniqueFilename}`);
    }

    return NextResponse.json({ paths }, { status: 200 });
  } catch (error) {
    console.error("Error uploading project files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

