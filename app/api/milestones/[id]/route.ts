/**
 * API Route: GET /api/milestones/[id], PUT /api/milestones/[id], DELETE /api/milestones/[id]
 * Handles individual milestone operations with MongoDB or mock JSON files
 */
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/src/lib/mongodb";
import { MilestoneI } from "@/src/models/milestone";
import { ObjectId } from "mongodb";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  findById,
  updateItem,
  deleteItem,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/milestones/[id]
 * Retrieve a single milestone by ID
 * Returns from mock JSON file if in mock mode, otherwise from MongoDB
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useMock = getUseMockData();

    let milestone: MilestoneI | null = null;

    if (useMock) {
      // Mock mode: Read from JSON file
      const milestones = await readMockDataFileServer<MilestoneI>(
        "mockMilestones.json"
      );
      milestone = findById(milestones, id) || null;
    } else {
      // Production mode: Read from MongoDB
      if (!process.env.MONGODB_URI) {
        console.error(
          "MONGODB_URI is not configured. Please set it in your .env file."
        );
        return NextResponse.json(
          {
            error:
              "Database not configured. Please set MONGODB_URI in your .env file.",
          },
          { status: 500 }
        );
      }

      const collection = await getCollection<MilestoneI>("milestones");

      // Try to find by MongoDB ObjectId first, then by numeric id
      let mongoDoc: (MilestoneI & { _id?: ObjectId }) | null = null;
      if (ObjectId.isValid(id) && id.length === 24) {
        mongoDoc = (await collection.findOne({ _id: new ObjectId(id) })) as
          | (MilestoneI & { _id?: ObjectId })
          | null;
      }

      // If not found, try numeric id
      if (!mongoDoc) {
        const numericId = Number(id);
        if (!isNaN(numericId)) {
          mongoDoc = (await collection.findOne({ id: numericId })) as
            | (MilestoneI & { _id?: ObjectId })
            | null;
        }
      }

      // Convert MongoDB ObjectId to string and ensure id field exists
      if (mongoDoc) {
        const { _id, ...rest } = mongoDoc;
        milestone = {
          ...rest,
          id:
            mongoDoc.id ||
            (_id ? parseInt(_id.toString().slice(-8), 16) : Date.now()),
        } as MilestoneI;
      }
    }

    if (!milestone) {
      return NextResponse.json(
        { error: `Milestone with id ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(milestone, { status: 200 });
  } catch (error) {
    console.error("Error fetching milestone:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch milestone: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/milestones/[id]
 * Update an existing milestone
 * Saves to mock JSON file if in mock mode, otherwise saves to MongoDB
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const useMock = getUseMockData();

    // Build update data (exclude id and timestamps from body, update updatedAt)
    const updateData: Partial<MilestoneI> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    delete updateData.id;
    delete updateData.createdAt;

    let updatedMilestone: MilestoneI;

    if (useMock) {
      // Mock mode: Update in JSON file
      updatedMilestone = await updateItem<MilestoneI>(
        "mockMilestones.json",
        id,
        updateData
      );
    } else {
      // Production mode: Update in MongoDB
      if (!process.env.MONGODB_URI) {
        console.error(
          "MONGODB_URI is not configured. Please set it in your .env file."
        );
        return NextResponse.json(
          {
            error:
              "Database not configured. Please set MONGODB_URI in your .env file.",
          },
          { status: 500 }
        );
      }

      const collection = await getCollection<MilestoneI>("milestones");

      // Try to find by MongoDB ObjectId first, then by numeric id
      let result: { value: (MilestoneI & { _id?: ObjectId }) | null } | null =
        null;

      // Check if id is a valid MongoDB ObjectId
      if (ObjectId.isValid(id) && id.length === 24) {
        result = (await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: "after" }
        )) as { value: (MilestoneI & { _id?: ObjectId }) | null } | null;
      }

      // If not found, try numeric id
      if (!result || !result.value) {
        const numericId = Number(id);
        if (!isNaN(numericId)) {
          result = (await collection.findOneAndUpdate(
            { id: numericId },
            { $set: updateData },
            { returnDocument: "after" }
          )) as { value: (MilestoneI & { _id?: ObjectId }) | null } | null;
        }
      }

      if (!result || !result.value) {
        return NextResponse.json(
          { error: `Milestone with id ${id} not found` },
          { status: 404 }
        );
      }

      // Convert MongoDB ObjectId to string and ensure id field exists
      const mongoDoc = result.value as MilestoneI & { _id?: ObjectId };
      const { _id, ...rest } = mongoDoc;
      updatedMilestone = {
        ...rest,
        id:
          mongoDoc.id ||
          (_id ? parseInt(_id.toString().slice(-8), 16) : Date.now()),
      } as MilestoneI;
    }

    return NextResponse.json(updatedMilestone, { status: 200 });
  } catch (error) {
    console.error("Error updating milestone:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update milestone: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/milestones/[id]
 * Delete a milestone
 * Deletes from mock JSON file if in mock mode, otherwise from MongoDB
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useMock = getUseMockData();

    if (useMock) {
      // Mock mode: Delete from JSON file
      const deleted = await deleteItem<MilestoneI>("mockMilestones.json", id);
      if (!deleted) {
        return NextResponse.json(
          { error: `Milestone with id ${id} not found` },
          { status: 404 }
        );
      }
    } else {
      // Production mode: Delete from MongoDB
      if (!process.env.MONGODB_URI) {
        console.error(
          "MONGODB_URI is not configured. Please set it in your .env file."
        );
        return NextResponse.json(
          {
            error:
              "Database not configured. Please set MONGODB_URI in your .env file.",
          },
          { status: 500 }
        );
      }

      const collection = await getCollection<MilestoneI>("milestones");

      // Try to delete by MongoDB ObjectId first, then by numeric id
      let result = null;

      // Check if id is a valid MongoDB ObjectId
      if (ObjectId.isValid(id) && id.length === 24) {
        result = await collection.deleteOne({ _id: new ObjectId(id) });
      }

      // If not found, try numeric id
      if (!result || result.deletedCount === 0) {
        const numericId = Number(id);
        if (!isNaN(numericId)) {
          result = await collection.deleteOne({ id: numericId });
        }
      }

      if (!result || result.deletedCount === 0) {
        return NextResponse.json(
          { error: `Milestone with id ${id} not found` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "Milestone deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting milestone:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete milestone: ${errorMessage}` },
      { status: 500 }
    );
  }
}
