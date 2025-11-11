/**
 * API Route: GET/POST /api/departments
 * Handle department operations
 */
import { NextRequest, NextResponse } from "next/server";
import { DepartmentI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import { createItem, readMockDataFileServer } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/departments
 * Get all departments, optionally filtered by universityId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");

    if (getUseMockData()) {
      const departments = await readMockDataFileServer<DepartmentI>("mockDepartments.json");
      
      if (universityId) {
        const numericUniversityId = parseInt(universityId, 10);
        const filtered = departments.filter((d) => d.universityId === numericUniversityId);
        return NextResponse.json(filtered, { status: 200 });
      }
      
      return NextResponse.json(departments, { status: 200 });
    }

    // Production mode - would use database
    // For now, return empty array as departments should be created via API
    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch departments: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/departments
 * Create a new department
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, universityId } = body;

    // Validate required fields
    if (!name || !universityId) {
      return NextResponse.json(
        { error: "Missing required fields: name, universityId" },
        { status: 400 }
      );
    }

    // Validate name is not empty
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Department name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate universityId is a number
    const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
    if (isNaN(numericUniversityId)) {
      return NextResponse.json(
        { error: "University ID must be a valid number" },
        { status: 400 }
      );
    }

    // Create department
    let department: DepartmentI;

    if (getUseMockData()) {
      // Check for duplicate name within the same university
      const existingDepartments = await readMockDataFileServer<DepartmentI>("mockDepartments.json");
      const duplicate = existingDepartments.find(
        (d) => d.name.toLowerCase() === name.toLowerCase().trim() && d.universityId === numericUniversityId
      );
      
      if (duplicate) {
        return NextResponse.json(
          { error: "A department with this name already exists for this university" },
          { status: 409 }
        );
      }

      department = await createItem<DepartmentI>("mockDepartments.json", {
        name: name.trim(),
        universityId: numericUniversityId,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Production mode - would use database
      // For now, return error as database integration is not implemented
      return NextResponse.json(
        { error: "Database integration not yet implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create department: ${errorMessage}` },
      { status: 500 }
    );
  }
}



