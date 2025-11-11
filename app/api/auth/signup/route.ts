/**
 * API Route: POST /api/auth/signup
 * User registration endpoint
 * Creates a new user account with password stored in user data
 */
import { NextRequest, NextResponse } from "next/server";
import { UserI, UserRole } from "@/src/models/user";
import { getUseMockData } from "@/src/utils/config";
import { createItem } from "@/src/utils/fileHelpers.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email, password, role } = body;

    // Validate required fields
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, email, password" },
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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
      // Create user in mock data with password stored in user object
      const newUser = await createItem<UserI>("mockUsers.json", {
        role: (role as UserRole) || "student", // Default to student if role not provided
        email: email.toLowerCase().trim(),
        name: firstName,
        password: password, // Store password in user data
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
      // Production mode - create user via API/repository
      // In production, this would create the user in the database
      // and store the hashed password securely
      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
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


