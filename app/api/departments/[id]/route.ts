/**
 * API Route: GET/PUT/DELETE /api/departments/[id]
 * Handle department operations by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { DepartmentI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import { 
  readMockDataFileServer, 
  updateItem, 
  deleteItem,
  findById as findByIdServer 
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/departments/[id]
 * Get department by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (getUseMockData()) {
      const departments = await readMockDataFileServer<DepartmentI>("mockDepartments.json");
      const department = findByIdServer(departments, id);
      
      if (!department) {
        return NextResponse.json(
          { error: `Department ${id} not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(department, { status: 200 });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Database integration not yet implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error fetching department:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch department: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/departments/[id]
 * Update department by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Department name cannot be empty" },
          { status: 400 }
        );
      }
    }

    let updated: DepartmentI;

    if (getUseMockData()) {
      const departments = await readMockDataFileServer<DepartmentI>("mockDepartments.json");
      const existing = findByIdServer(departments, id);
      
      if (!existing) {
        return NextResponse.json(
          { error: `Department ${id} not found` },
          { status: 404 }
        );
      }

      // Check for duplicate name if name is being updated
      if (body.name && body.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
        const duplicate = departments.find(
          (d) => 
            d.id !== existing.id &&
            d.name.toLowerCase() === body.name.toLowerCase().trim() &&
            d.universityId === existing.universityId
        );
        
        if (duplicate) {
          return NextResponse.json(
            { error: "A department with this name already exists for this university" },
            { status: 409 }
          );
        }
      }
      
      updated = await updateItem<DepartmentI>("mockDepartments.json", id, {
        ...body,
        name: body.name ? body.name.trim() : existing.name,
      });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Database integration not yet implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating department:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update department: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/departments/[id]
 * Delete department by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (getUseMockData()) {
      const deleted = await deleteItem<DepartmentI>("mockDepartments.json", id);
      
      if (!deleted) {
        return NextResponse.json(
          { error: `Department ${id} not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Database integration not yet implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete department: ${errorMessage}` },
      { status: 500 }
    );
  }
}



