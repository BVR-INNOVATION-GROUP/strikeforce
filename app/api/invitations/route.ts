/**
 * API Route: POST /api/invitations
 * Create a new invitation for students or supervisors
 * PRD Reference: Section 4 - Students receive invitation links when created
 */
import { NextRequest, NextResponse } from "next/server";
import { InvitationI, InvitationRole, InvitationStatus } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, universityId, orgId, token, expiresAt, status = "PENDING" } = body;

    // Validate required fields
    if (!email || !role || !token || !expiresAt) {
      return NextResponse.json(
        { error: "Missing required fields: email, role, token, expiresAt" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== "student" && role !== "supervisor") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'student' or 'supervisor'" },
        { status: 400 }
      );
    }

    // Validate that universityId is provided for students/supervisors
    if ((role === "student" || role === "supervisor") && !universityId) {
      return NextResponse.json(
        { error: "universityId is required for student and supervisor invitations" },
        { status: 400 }
      );
    }

    // Validate status
    if (status !== "PENDING" && status !== "USED" && status !== "EXPIRED") {
      return NextResponse.json(
        { error: "Invalid status. Must be 'PENDING', 'USED', or 'EXPIRED'" },
        { status: 400 }
      );
    }

    // Check if invitation already exists with this email and token (in mock mode)
    if (getUseMockData()) {
      try {
        const invitationsData = await import("@/src/data/mockInvitations.json");
        const invitations = invitationsData.default as InvitationI[];
        const existingInvitation = invitations.find(
          (inv) => inv.email.toLowerCase() === email.toLowerCase() && inv.token === token
        );

        if (existingInvitation) {
          return NextResponse.json(
            { error: "Invitation with this email and token already exists" },
            { status: 409 }
          );
        }
      } catch {
        // File doesn't exist yet, continue with creation
      }
    }

    // Create invitation
    let invitation: InvitationI;

    if (getUseMockData()) {
      invitation = await createItem<InvitationI>("mockInvitations.json", {
        email: email.toLowerCase().trim(),
        role: role as InvitationRole,
        universityId: universityId ? (typeof universityId === 'string' ? parseInt(universityId, 10) : universityId) : undefined,
        orgId: orgId ? (typeof orgId === 'string' ? parseInt(orgId, 10) : orgId) : undefined,
        token,
        expiresAt,
        status: status as InvitationStatus,
        createdAt: new Date().toISOString(),
      } as Omit<InvitationI, "id">);
    } else {
      // Production mode - would use database
      // For now, return error as database integration is not implemented
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/invitations
 * Get all invitations, optionally filtered by universityId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get("universityId");

    if (getUseMockData()) {
      try {
        const invitationsData = await import("@/src/data/mockInvitations.json");
        let invitations = invitationsData.default as InvitationI[];

        if (universityId) {
          const numericUniversityId = parseInt(universityId, 10);
          invitations = invitations.filter(
            (inv) => inv.universityId === numericUniversityId
          );
        }

        return NextResponse.json(invitations);
      } catch {
        // File doesn't exist yet, return empty array
        return NextResponse.json([]);
      }
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error fetching invitations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch invitations: ${errorMessage}` },
      { status: 500 }
    );
  }
}



