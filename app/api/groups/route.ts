/**
 * API Route: GET, POST /api/groups
 * Groups CRUD operations
 */
import { NextRequest, NextResponse } from "next/server";
import { GroupI } from "@/src/models/group";
import { getUseMockData } from "@/src/utils/config";
import { readMockDataFileServer, createItem } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/groups
 * Get all groups with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");

    if (getUseMockData()) {
      let groups = await readMockDataFileServer<GroupI>("mockGroups.json");

      // Apply filters
      if (courseId) {
        const numericCourseId = parseInt(courseId, 10);
        groups = groups.filter((g) => g.courseId === numericCourseId);
      }
      if (userId) {
        const numericUserId = parseInt(userId, 10);
        groups = groups.filter(
          (g) => g.leaderId === numericUserId || g.memberIds.includes(numericUserId)
        );
      }

      return NextResponse.json(groups);
    }

    // Production mode - would query database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch groups: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, leaderId, memberIds, name, capacity } = body;

    // Validate required fields
    if (!courseId || !leaderId || !name || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, leaderId, name, capacity" },
        { status: 400 }
      );
    }

    // Validate capacity
    if (capacity < 2 || capacity > 10) {
      return NextResponse.json(
        { error: "Capacity must be between 2 and 10" },
        { status: 400 }
      );
    }

    // Convert IDs to numbers
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    const numericLeaderId = typeof leaderId === 'string' ? parseInt(leaderId, 10) : leaderId;
    const numericMemberIds = (memberIds || []).map((id: string | number) =>
      typeof id === 'string' ? parseInt(id, 10) : id
    );

    // Validate member count against capacity
    const totalMembers = 1 + numericMemberIds.length; // Leader + members
    if (totalMembers > capacity) {
      return NextResponse.json(
        { error: `Total members (${totalMembers}) exceeds capacity (${capacity})` },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      // Ensure leader is in memberIds
      const allMemberIds = numericMemberIds.includes(numericLeaderId)
        ? numericMemberIds
        : [numericLeaderId, ...numericMemberIds];

      const newGroup = await createItem<GroupI>("mockGroups.json", {
        courseId: numericCourseId,
        leaderId: numericLeaderId,
        memberIds: allMemberIds,
        name: name.trim(),
        capacity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<GroupI, "id">);

      return NextResponse.json(newGroup, { status: 201 });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create group: ${errorMessage}` },
      { status: 500 }
    );
  }
}

