/**
 * API Route: POST /api/auth/reset-password
 * Reset password using token - validates token and updates password
 */
import { NextRequest, NextResponse } from "next/server";
import { getUseMockData } from "@/src/utils/config";
import { hashPassword } from "@/src/utils/passwordHash";
import { 
  readMockDataFileServer, 
  updateItem,
  findById as findByIdServer
} from "@/src/utils/fileHelpers.server";
import { UserI } from "@/src/models/user";
import { PasswordResetTokenI } from "@/src/models/passwordReset";
import { getCollection } from "@/src/lib/mongodb";

/**
 * Validate and use password reset token
 * @param token - Reset token from email
 * @param newPassword - New password to set
 */
async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<void> {
  // Find token
  let resetToken: PasswordResetTokenI | null = null;

  if (getUseMockData()) {
    const tokens = await readMockDataFileServer<PasswordResetTokenI>(
      "mockPasswordResetTokens.json"
    );
    resetToken = tokens.find(
      (t) => t.token === token && !t.used
    ) || null;
  } else {
    // Production: Find token in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured. Please set it in your .env file.");
      throw new Error("Database not configured");
    }
    const tokensCollection = await getCollection<PasswordResetTokenI>(
      "passwordResetTokens"
    );
    resetToken = await tokensCollection.findOne({
      token,
      used: false,
    });
  }

  // Validate token exists
  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Check if token is expired
  const expiresAt = new Date(resetToken.expiresAt);
  if (expiresAt < new Date()) {
    throw new Error("Reset token has expired");
  }

  // Check if token is already used
  if (resetToken.used) {
    throw new Error("Reset token has already been used");
  }

  // Find user
  let user: UserI | null = null;

  if (getUseMockData()) {
    const users = await readMockDataFileServer<UserI>("mockUsers.json");
    user = findByIdServer(users, resetToken.userId) || null;
  } else {
    // Production: Find user in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured. Please set it in your .env file.");
      throw new Error("Database not configured");
    }
    const usersCollection = await getCollection<UserI>("users");
    user = await usersCollection.findOne({ id: resetToken.userId });
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  if (getUseMockData()) {
    // Update password in mock data
    // Note: In production, password should be hashed before storage
    // For mock data, we'll store the hashed password
    await updateItem<UserI>("mockUsers.json", user.id, {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Production: Update password in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured. Please set it in your .env file.");
      throw new Error("Database not configured");
    }
    const usersCollection = await getCollection<UserI>("users");
    await usersCollection.updateOne(
      { id: user.id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  // Mark token as used
  if (getUseMockData()) {
    await updateItem<PasswordResetTokenI>(
      "mockPasswordResetTokens.json",
      resetToken.id,
      {
        used: true,
      }
    );
  } else {
    // Production: Mark token as used in MongoDB
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured. Please set it in your .env file.");
      throw new Error("Database not configured");
    }
    const tokensCollection = await getCollection<PasswordResetTokenI>(
      "passwordResetTokens"
    );
    await tokensCollection.updateOne(
      { token },
      {
        $set: {
          used: true,
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
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

    // Reset password with token
    await resetPasswordWithToken(token, password);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return appropriate error messages
    if (errorMessage.includes("Invalid") || errorMessage.includes("expired") || errorMessage.includes("used")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Failed to reset password: ${errorMessage}` },
      { status: 500 }
    );
  }
}

