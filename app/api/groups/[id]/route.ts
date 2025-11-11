/**
 * API Route: GET, PUT, DELETE /api/groups/[id]
 * Individual group operations
 */
import { NextRequest, NextResponse } from "next/server";
import { GroupI } from "@/src/models/group";
import { getUseMockData } from "@/src/utils/config";
import { readMockDataFileServer, updateItem, deleteItem, findById } from "@/src/utils/fileHelpers.server";

/**
 * GET /api/groups/[id]
 * Get group by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid group ID" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const groups = await readMockDataFileServer<GroupI>("mockGroups.json");
      const group = findById(groups, numericId);

      if (!group) {
        return NextResponse.json(
          { error: `Group ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(group);
    }

    // Production mode - would query database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error fetching group:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch group: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/groups/[id]
 * Update group (name, capacity, members)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { name, capacity, memberIds, leaderId } = body;

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid group ID" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const groups = await readMockDataFileServer<GroupI>("mockGroups.json");
      const existingGroup = findById(groups, numericId);

      if (!existingGroup) {
        return NextResponse.json(
          { error: `Group ${id} not found` },
          { status: 404 }
        );
      }

      // Convert memberIds to numbers if provided
      const numericMemberIds = memberIds
        ? memberIds.map((id: string | number) =>
            typeof id === 'string' ? parseInt(id, 10) : id
          )
        : existingGroup.memberIds;

      // Validate capacity if provided
      if (capacity !== undefined) {
        if (capacity < 2 || capacity > 10) {
          return NextResponse.json(
            { error: "Capacity must be between 2 and 10" },
            { status: 400 }
          );
        }

        const totalMembers = numericMemberIds.length;
        if (totalMembers > capacity) {
          return NextResponse.json(
            { error: `Total members (${totalMembers}) exceeds capacity (${capacity})` },
            { status: 400 }
          );
        }
      }

      const updatedGroup = await updateItem<GroupI>(
        "mockGroups.json",
        numericId,
        {
          ...existingGroup,
          name: name !== undefined ? name.trim() : existingGroup.name,
          capacity: capacity !== undefined ? capacity : existingGroup.capacity,
          memberIds: numericMemberIds,
          leaderId: leaderId !== undefined
            ? (typeof leaderId === 'string' ? parseInt(leaderId, 10) : leaderId)
            : existingGroup.leaderId,
          updatedAt: new Date().toISOString(),
        }
      );

      return NextResponse.json(updatedGroup);
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error updating group:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update group: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid group ID" },
        { status: 400 }
      );
    }

    if (getUseMockData()) {
      const groups = await readMockDataFileServer<GroupI>("mockGroups.json");
      const existingGroup = findById(groups, numericId);

      if (!existingGroup) {
        return NextResponse.json(
          { error: `Group ${id} not found` },
          { status: 404 }
        );
      }

      await deleteItem("mockGroups.json", numericId);
      return NextResponse.json({ success: true });
    }

    // Production mode - would use database
    return NextResponse.json(
      { error: "Production mode not yet implemented. Please use mock data mode." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error deleting group:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete group: ${errorMessage}` },
      { status: 500 }
    );
  }
}

