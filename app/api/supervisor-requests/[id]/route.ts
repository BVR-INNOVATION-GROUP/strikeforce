/**
 * API Route: GET, PUT, DELETE /api/supervisor-requests/[id]
 * Individual supervisor request operations
 */
import { NextRequest, NextResponse } from "next/server";
import { SupervisorRequestI, SupervisorRequestStatus } from "@/src/models/supervisor";
import { getUseMockData } from "@/src/utils/config";
import { readMockDataFileServer, updateItem, deleteItem, findById } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/supervisor-requests/[id]
 * Get supervisor request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const requests = await readMockDataFileServer<SupervisorRequestI>("mockSupervisorRequests.json");
      const request = findById(requests, numericId);

      if (!request) {
        return NextResponse.json(
          { error: `Supervisor request ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(request);
    }

    // Production mode - would query database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error fetching supervisor request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch supervisor request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/supervisor-requests/[id]
 * Update supervisor request (e.g., approve/deny)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { status, message } = body;

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !["PENDING", "APPROVED", "DENIED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, APPROVED, or DENIED" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const requests = await readMockDataFileServer<SupervisorRequestI>("mockSupervisorRequests.json");
      const existingRequest = findById(requests, numericId);

      if (!existingRequest) {
        return NextResponse.json(
          { error: `Supervisor request ${id} not found` },
          { status: 404 }
        );
      }

      const updatedRequest = await updateItem<SupervisorRequestI>(
        "mockSupervisorRequests.json",
        numericId,
        {
          ...existingRequest,
          status: status || existingRequest.status,
          message: message !== undefined ? message : existingRequest.message,
          updatedAt: new Date().toISOString(),
        }
      );

      return NextResponse.json(updatedRequest);
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error updating supervisor request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update supervisor request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/supervisor-requests/[id]
 * Delete supervisor request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const requests = await readMockDataFileServer<SupervisorRequestI>("mockSupervisorRequests.json");
      const existingRequest = findById(requests, numericId);

      if (!existingRequest) {
        return NextResponse.json(
          { error: `Supervisor request ${id} not found` },
          { status: 404 }
        );
      }

      await deleteItem("mockSupervisorRequests.json", numericId);
      return NextResponse.json({ success: true });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error deleting supervisor request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete supervisor request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

