/**
 * API Route: POST /api/users
 * Create a new user account
 * Used when creating students/supervisors via invitation
 */
import { NextRequest, NextResponse } from "next/server";
import { UserI, UserRole } from "@/src/models/user";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, universityId, orgId, courseId, departmentId, password } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, role" },
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
    const validRoles: UserRole[] = ["partner", "student", "supervisor", "university-admin", "super-admin"];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
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

    // Create user account
    if (getUseMockData()) {
      // Convert IDs to numbers if they're strings
      const numericUniversityId = universityId 
        ? (typeof universityId === 'string' ? parseInt(universityId, 10) : universityId)
        : undefined;
      const numericOrgId = orgId 
        ? (typeof orgId === 'string' ? parseInt(orgId, 10) : orgId)
        : undefined;
      const numericCourseId = courseId 
        ? (typeof courseId === 'string' ? parseInt(courseId, 10) : courseId)
        : undefined;
      const numericDepartmentId = departmentId 
        ? (typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId)
        : undefined;

      const newUser = await createItem<UserI>("mockUsers.json", {
        role: role as UserRole,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: password || undefined, // Optional password (will be set when accepting invitation)
        universityId: numericUniversityId,
        orgId: numericOrgId,
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

      // Return user without password for security
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } else {
      // Production mode - create user via database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create user: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/users
 * Get all users, optionally filtered by role
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (getUseMockData()) {
      const usersData = await import("@/src/data/mockUsers.json");
      let users = usersData.default as UserI[];

      if (role) {
        users = users.filter((u) => u.role === role);
      }

      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      return NextResponse.json(usersWithoutPasswords);
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch users: ${errorMessage}` },
      { status: 500 }
    );
  }
}

