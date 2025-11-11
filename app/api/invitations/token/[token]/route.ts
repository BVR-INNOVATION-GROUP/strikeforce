/**
 * API Route: GET /api/invitations/token/[token]
 * Get invitation by token
 */
import { NextRequest, NextResponse } from "next/server";
import { InvitationI } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { readMockDataFileServer } from "@/src/utils/fileHelpers.server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (getUseMockData()) {
      const invitations = await readMockDataFileServer<InvitationI>("mockInvitations.json");
      const invitation = invitations.find((inv) => inv.token === token);
      if (!invitation) {
        return NextResponse.json(
          { error: `Invitation with token not found` },
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
    console.error("Error fetching invitation by token:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}



