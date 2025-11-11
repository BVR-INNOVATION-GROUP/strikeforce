/**
 * API Route: GET/PUT/DELETE /api/invitations/[id]
 * Handle invitation operations by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { InvitationI, InvitationStatus } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { 
  readMockDataFileServer, 
  updateItem, 
  deleteItem,
  findById as findByIdServer 
} from "@/src/utils/fileHelpers.server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (getUseMockData()) {
      const invitations = await readMockDataFileServer<InvitationI>("mockInvitations.json");
      const invitation = findByIdServer(invitations, id);
      if (!invitation) {
        return NextResponse.json(
          { error: `Invitation ${id} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json(invitation, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error fetching invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (getUseMockData()) {
      const invitations = await readMockDataFileServer<InvitationI>("mockInvitations.json");
      const invitation = findByIdServer(invitations, id);
      if (!invitation) {
        return NextResponse.json(
          { error: `Invitation ${id} not found` },
          { status: 404 }
        );
      }

      // Validate status if provided
      if (body.status && body.status !== "PENDING" && body.status !== "USED" && body.status !== "EXPIRED") {
        return NextResponse.json(
          { error: "Invalid status. Must be 'PENDING', 'USED', or 'EXPIRED'" },
          { status: 400 }
        );
      }

      const updated = await updateItem<InvitationI>("mockInvitations.json", id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json(updated, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error updating invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (getUseMockData()) {
      const invitations = await readMockDataFileServer<InvitationI>("mockInvitations.json");
      const invitation = findByIdServer(invitations, id);
      if (!invitation) {
        return NextResponse.json(
          { error: `Invitation ${id} not found` },
          { status: 404 }
        );
      }

      await deleteItem("mockInvitations.json", id);
      return NextResponse.json({ message: "Invitation deleted successfully" }, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error deleting invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

