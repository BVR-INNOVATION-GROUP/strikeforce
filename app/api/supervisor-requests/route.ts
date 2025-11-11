/**
 * API Route: GET, POST /api/supervisor-requests
 * Supervisor requests CRUD operations
 */
import { NextRequest, NextResponse } from "next/server";
import { SupervisorRequestI } from "@/src/models/supervisor";
import { getUseMockData } from "@/src/utils/config";
import { readMockDataFileServer, createItem, updateItem, deleteItem, findById } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/supervisor-requests
 * Get all supervisor requests with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get("supervisorId");
    const projectId = searchParams.get("projectId");
    const studentId = searchParams.get("studentId");

    if (getUseMockData()) {
      let requests = await readMockDataFileServer<SupervisorRequestI>("mockSupervisorRequests.json");

      // Apply filters
      if (supervisorId) {
        const numericSupervisorId = parseInt(supervisorId, 10);
        requests = requests.filter((r) => r.supervisorId === numericSupervisorId);
      }
      if (projectId) {
        const numericProjectId = parseInt(projectId, 10);
        requests = requests.filter((r) => r.projectId === numericProjectId);
      }
      if (studentId) {
        const numericStudentId = parseInt(studentId, 10);
        requests = requests.filter((r) => r.studentOrGroupId === numericStudentId);
      }

      return NextResponse.json(requests);
    }

    // Production mode - would query database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error fetching supervisor requests:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch supervisor requests: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/supervisor-requests
 * Create a new supervisor request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, supervisorId, studentOrGroupId, message } = body;

    // Validate required fields
    if (!projectId || !supervisorId || !studentOrGroupId) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, supervisorId, studentOrGroupId" },
        { status: 400 }
      );
    }

    // Convert IDs to numbers
    const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
    const numericSupervisorId = typeof supervisorId === 'string' ? parseInt(supervisorId, 10) : supervisorId;
    const numericStudentOrGroupId = typeof studentOrGroupId === 'string' ? parseInt(studentOrGroupId, 10) : studentOrGroupId;

    if (getUseMockData()) {
      // Check for duplicate requests
      const existingRequests = await readMockDataFileServer<SupervisorRequestI>("mockSupervisorRequests.json");
      const duplicate = existingRequests.find(
        (r) =>
          r.projectId === numericProjectId &&
          r.supervisorId === numericSupervisorId &&
          r.studentOrGroupId === numericStudentOrGroupId &&
          r.status === "PENDING"
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "A pending request already exists for this project and supervisor" },
          { status: 409 }
        );
      }

      const newRequest = await createItem<SupervisorRequestI>("mockSupervisorRequests.json", {
        projectId: numericProjectId,
        supervisorId: numericSupervisorId,
        studentOrGroupId: numericStudentOrGroupId,
        status: "PENDING",
        message: message || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<SupervisorRequestI, "id">);

      return NextResponse.json(newRequest, { status: 201 });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error creating supervisor request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create supervisor request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

