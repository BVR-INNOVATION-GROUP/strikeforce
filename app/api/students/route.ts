/**
 * API Route: POST /api/students
 * Create a new student with invitation and send email
 * Handles invitation creation, user creation, and email sending server-side
 */
import { NextRequest, NextResponse } from "next/server";
import { UserI, UserRole } from "@/src/models/user";
import { InvitationI, InvitationRole, InvitationStatus } from "@/src/models/invitation";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";
import { sendInvitationEmail } from "@/src/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, courseId, departmentId, universityId, organizationName } = body;

    // Validate required fields
    if (!name || !email || !courseId || !universityId) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, courseId, universityId" },
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

    // Check if user already exists
    if (getUseMockData()) {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Convert IDs to numbers if they're strings
    const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    const numericDepartmentId = departmentId 
      ? (typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId)
      : undefined;

    // Create invitation server-side directly (avoiding API call from server)
    // Generate secure token
    const array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Calculate expiry date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation directly using file helpers (server-side)
    let invitation: InvitationI;
    if (getUseMockData()) {
      invitation = await createItem<InvitationI>("mockInvitations.json", {
        email: email.toLowerCase().trim(),
        role: "student" as InvitationRole,
        universityId: numericUniversityId,
        token,
        expiresAt: expiresAt.toISOString(),
        status: "PENDING" as InvitationStatus,
        createdAt: new Date().toISOString(),
      } as Omit<InvitationI, "id">);
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }

    // Create user account
    let newUser: UserI;
    if (getUseMockData()) {
      newUser = await createItem<UserI>("mockUsers.json", {
        role: "student" as UserRole,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        universityId: numericUniversityId,
        courseId: numericCourseId,
        departmentId: numericDepartmentId,
        profile: {
          avatar: undefined,
          bio: "",
          skills: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<UserI, "id">);
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }

    // Send invitation email server-side (sender email from env)
    try {
      const orgName = organizationName || "University";
      await sendInvitationEmail(email, invitation.token, "student", orgName);
    } catch (emailError) {
      // Log but don't fail the request - user and invitation are created
      console.error("Failed to send invitation email:", emailError);
      // Still return success since user and invitation are created
    }

    // Return user without password for security
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { 
        user: userWithoutPassword,
        invitation: invitation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create student: ${errorMessage}` },
      { status: 500 }
    );
  }
}

