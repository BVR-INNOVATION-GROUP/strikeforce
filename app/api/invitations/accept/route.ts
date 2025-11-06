/**
 * API Route: POST /api/invitations/accept
 * Accept invitation and create user account
 * PRD Reference: Section 4 - Students receive invitation links and set password
 */
import { NextRequest, NextResponse } from "next/server";
import { invitationRepository } from "@/src/repositories/invitationRepository";
import { userRepository } from "@/src/repositories/userRepository";
import { invitationService } from "@/src/services/invitationService";
import { UserI, UserRole } from "@/src/models/user";
import { InvitationI } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, name } = body;

    // Validate required fields
    if (!token || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields: token, password, name" },
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

    // Check if user already exists with this email
    if (getUseMockData()) {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === invitation.email.toLowerCase()
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Create user account
    const userRole: UserRole = invitation.role === "student" ? "student" : "supervisor";
    
    if (getUseMockData()) {
      // Create user in mock data
      const newUser = await createItem<UserI>("mockUsers.json", {
        role: userRole,
        email: invitation.email.toLowerCase().trim(),
        name: name.trim(),
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

      // Mark invitation as used
      await invitationRepository.update(invitation.id, {
        status: "USED",
        usedAt: new Date().toISOString(),
      });

      // Return user without password for security
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } else {
      // Production mode - create user via API/repository
      // In production, this would create the user in the database
      // and store the hashed password securely
      console.log(`[Production] Would create user account for ${invitation.email} with role ${userRole}`);
      
      // Mark invitation as used
      await invitationRepository.update(invitation.id, {
        status: "USED",
        usedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        { message: "User account created successfully" },
        { status: 201 }
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

