/**
 * API Route: GET/PUT/DELETE /api/users/[id]
 * Handle user operations by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { UserI } from "@/src/models/user";
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
      const users = await readMockDataFileServer<UserI>("mockUsers.json");
      const user = findByIdServer(users, id);
      if (!user) {
        return NextResponse.json(
          { error: `User ${id} not found` },
          { status: 404 }
        );
      }
      // Return user without password for security
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch user: ${errorMessage}` },
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
      const users = await readMockDataFileServer<UserI>("mockUsers.json");
      const user = findByIdServer(users, id);
      if (!user) {
        return NextResponse.json(
          { error: `User ${id} not found` },
          { status: 404 }
        );
      }

      const updated = await updateItem<UserI>("mockUsers.json", id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });

      // Return user without password for security
      const { password: _, ...userWithoutPassword } = updated;
      return NextResponse.json(userWithoutPassword, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update user: ${errorMessage}` },
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
      const users = await readMockDataFileServer<UserI>("mockUsers.json");
      const user = findByIdServer(users, id);
      if (!user) {
        return NextResponse.json(
          { error: `User ${id} not found` },
          { status: 404 }
        );
      }

      await deleteItem("mockUsers.json", id);
      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } else {
      // Production mode - would use database
      return NextResponse.json(
        { error: "Production mode not yet implemented. Please use mock data mode." },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete user: ${errorMessage}` },
      { status: 500 }
    );
  }
}

