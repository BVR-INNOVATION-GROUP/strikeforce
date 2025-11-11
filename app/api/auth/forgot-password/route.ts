/**
 * API Route: POST /api/auth/forgot-password
 * Request password reset - generates token and sends reset email
 */
import { NextRequest, NextResponse } from "next/server";
import { getUseMockData } from "@/src/utils/config";
import { sendPasswordResetEmail } from "@/src/services/emailService";
import {
  readMockDataFileServer,
  createItem,
} from "@/src/utils/fileHelpers.server";
import { UserI } from "@/src/models/user";
import { PasswordResetTokenI } from "@/src/models/passwordReset";
import { getCollection } from "@/src/lib/mongodb";
import { randomBytes } from "crypto";

// Route segment config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Generate a secure random token for password reset
 * @returns Secure random token string
 */
function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create password reset token and send email
 * @param email - User email address
 */
async function createPasswordResetToken(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email
  let user: UserI | null = null;

  if (getUseMockData()) {
    try {
      const users = await readMockDataFileServer<UserI>("mockUsers.json");
      user =
        users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
    } catch (error) {
      console.error("Failed to read users from mock data:", error);
      throw new Error("Failed to read user data");
    }
  } else {
    // Production: Find user in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error(
        "MONGODB_URI is not configured. Please set it in your .env file."
      );
      throw new Error("Database not configured");
    }
    const usersCollection = await getCollection<UserI>("users");
    user = await usersCollection.findOne({
      email: normalizedEmail,
    });
  }

  // Don't reveal if email exists or not (security best practice)
  // Always return success, but only send email if user exists
  if (!user) {
    // Log for debugging but don't reveal to client
    console.log(
      `Password reset requested for non-existent email: ${normalizedEmail}`
    );
    return;
  }

  // Generate reset token
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  // Store reset token
  if (getUseMockData()) {
    try {
      // Store in mock data file
      await createItem<PasswordResetTokenI>("mockPasswordResetTokens.json", {
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        used: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to create reset token in mock data:", error);
      throw new Error("Failed to create reset token");
    }
  } else {
    // Production: Store in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error(
        "MONGODB_URI is not configured. Please set it in your .env file."
      );
      throw new Error("Database not configured");
    }
    const tokensCollection = await getCollection<PasswordResetTokenI>(
      "passwordResetTokens"
    );

    // Invalidate unknown existing unused tokens for this user
    await tokensCollection.updateMany(
      { userId: user.id, used: false },
      { $set: { used: true } }
    );

    // Create new token
    const resetToken: PasswordResetTokenI = {
      id: Date.now(),
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    };

    await tokensCollection.insertOne(resetToken);
  }

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, token, user.name);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    // Don't throw - we don't want to reveal if email sending failed
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create reset token and send email
    await createPasswordResetToken(email);

    // Always return success (security best practice - don't reveal if email exists)
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password reset request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      { error: `Failed to process password reset request: ${errorMessage}` },
      { status: 500 }
    );
  }
}