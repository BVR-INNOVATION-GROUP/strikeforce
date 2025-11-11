/**
 * API Route: GET /api/milestones, POST /api/milestones
 * Handles milestone CRUD operations with MongoDB or mock JSON files
 */
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/src/lib/mongodb";
import { MilestoneI } from "@/src/models/milestone";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  createItem,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/milestones
 * Retrieve all milestones (with optional projectId filter)
 * Returns from mock JSON file if in mock mode, otherwise from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const useMock = getUseMockData();

    let milestones: MilestoneI[];

    if (useMock) {
      // Mock mode: Read from JSON file
      milestones = await readMockDataFileServer<MilestoneI>(
        "mockMilestones.json"
      );

      // Apply projectId filter if provided
      if (projectId) {
        const numericProjectId = Number(projectId);
        milestones = milestones.filter((m) => m.projectId === numericProjectId);
      }
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

      // Build query filter
      const filter: Record<string, unknown> = {};
      if (projectId) {
        const numericProjectId = Number(projectId);
        if (!isNaN(numericProjectId)) {
          filter.projectId = numericProjectId;
        }
      }

      // Query milestones
      const dbMilestones = await collection.find(filter).toArray();

      // Convert MongoDB ObjectId to string and ensure id field exists
      milestones = dbMilestones.map((milestone) => ({
        ...milestone,
        id:
          milestone.id ||
          (milestone._id
            ? parseInt(milestone._id.toString().slice(-8), 16)
            : Date.now()),
        _id: milestone._id?.toString(),
      })) as MilestoneI[];
    }

    return NextResponse.json(milestones, { status: 200 });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch milestones: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/milestones
 * Create a new milestone
 * Saves to mock JSON file if in mock mode, otherwise saves to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = getUseMockData();

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!body.dueDate) {
      return NextResponse.json(
        { error: "dueDate is required" },
        { status: 400 }
      );
    }

    // Convert projectId to number if it's a string
    const numericProjectId =
      typeof body.projectId === "string"
        ? parseInt(body.projectId, 10)
        : Number(body.projectId);

    if (isNaN(numericProjectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }

    // Add timestamps and ensure proper types
    const milestoneData: Omit<MilestoneI, "id"> = {
      ...body,
      projectId: numericProjectId,
      amount:
        typeof body.amount === "string"
          ? parseFloat(body.amount)
          : body.amount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let createdMilestone: MilestoneI;

    if (useMock) {
      // Mock mode: Save to JSON file
      createdMilestone = await createItem<MilestoneI>(
        "mockMilestones.json",
        milestoneData
      );
    } else {
      // Production mode: Save to MongoDB
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

      // Generate numeric ID if not provided
      let milestoneId = body.id;
      if (!milestoneId || isNaN(Number(milestoneId))) {
        milestoneId = Date.now();
      }

      // Add ID to milestone
      const newMilestone: MilestoneI = {
        ...milestoneData,
        id: Number(milestoneId),
      };

      // Insert milestone
      const result = await collection.insertOne(newMilestone as MilestoneI);

      // Fetch the created milestone
      const fetchedMilestone = await collection.findOne({
        _id: result.insertedId,
      });

      if (!fetchedMilestone) {
        throw new Error("Failed to create milestone");
      }

      createdMilestone = {
        ...fetchedMilestone,
        id: fetchedMilestone.id || Number(milestoneId),
      } as MilestoneI;
    }

    // Return milestone (with _id for MongoDB compatibility)
    const responseData = {
      ...createdMilestone,
      _id:
        (createdMilestone as MilestoneI & { _id?: string })._id?.toString() ||
        undefined,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create milestone: ${errorMessage}` },
      { status: 500 }
    );
  }
}
