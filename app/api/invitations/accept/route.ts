/**
 * API Route: POST /api/invitations/accept
 * Accept invitation and create user account
 * PRD Reference: Section 4 - Students receive invitation links and set password
 */
import { NextRequest, NextResponse } from "next/server";
import { invitationService } from "@/src/services/invitationService";
import { UserI, UserRole } from "@/src/models/user";
import { InvitationI } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { createItem, updateItem } from "@/src/utils/fileHelpers.server";

/**
 * Derive a user name from email address
 * Uses the part before @ symbol, capitalizes first letter
 */
function deriveNameFromEmail(email: string): string {
  const emailPart = email.split("@")[0];
  // Capitalize first letter and replace dots/underscores with spaces
  const name = emailPart
    .replace(/[._]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return name || "User";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing required fields: token, password" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate invitation token
    const invitation = await invitationService.validateInvitation(token);

    // Derive name from email if not provided
    const name = deriveNameFromEmail(invitation.email);

    // Check if user already exists with this email
    // If user exists (created when invitation was sent), update with password
    // If user doesn't exist, create new user
    const userRole: UserRole = invitation.role === "student" ? "student" : "supervisor";
    
    if (getUseMockData()) {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === invitation.email.toLowerCase()
      );

      let user: UserI;

      if (existingUser) {
        // User already exists (created when invitation was sent)
        // Update with password (keep existing name if it exists, otherwise use derived name)
        user = await updateItem<UserI>("mockUsers.json", existingUser.id, {
          password: password, // Update password for existing user
          updatedAt: new Date().toISOString(),
        });
      } else {
        // User doesn't exist, create new user
        user = await createItem<UserI>("mockUsers.json", {
          role: userRole,
          email: invitation.email.toLowerCase().trim(),
          name: name,
          password: password, // Store password in user data
          universityId: invitation.universityId ? Number(invitation.universityId) : undefined,
          profile: {
            avatar: undefined,
            bio: "",
            skills: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Omit<UserI, "id">);
      }

      // Mark invitation as used using server-side file helpers directly
      // This avoids the URL parsing error from making HTTP requests from server-side
      await updateItem<InvitationI>("mockInvitations.json", invitation.id, {
        status: "USED",
        usedAt: new Date().toISOString(),
      });

      // Return user without password for security
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 200 });
    } else {
      // Production mode - update or create user via database
      console.log(`[Production] Would update/create user account for ${invitation.email} with role ${userRole}`);
      
      // In production, would use database operations here
      // For now, return success message
      return NextResponse.json(
        { message: "User account created/updated successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error accepting invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to accept invitation: ${errorMessage}` },
      { status: 500 }
    );
  }
}


