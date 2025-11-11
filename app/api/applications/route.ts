/**
 * API Route: GET /api/applications, POST /api/applications
 * Handles application CRUD operations with MongoDB or mock JSON files
 */
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/src/lib/mongodb";
import { ApplicationI } from "@/src/models/application";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  writeMockDataFile,
  createItem,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/applications
 * Retrieve all applications (with optional filters)
 * Returns from mock JSON file if in mock mode, otherwise from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");
    const useMock = getUseMockData();

    let applications: ApplicationI[];

    if (useMock) {
      // Mock mode: Read from JSON file
      applications = await readMockDataFileServer<ApplicationI>(
        "mockApplications.json"
      );

      // Filter by projectId if provided (handle both string and number in JSON)
      if (projectId) {
        const numericProjectId =
          typeof projectId === "string"
            ? parseInt(projectId, 10)
            : Number(projectId);
        applications = applications.filter((a) => {
          const appProjectId =
            typeof a.projectId === "string"
              ? parseInt(a.projectId, 10)
              : a.projectId;
          return appProjectId === numericProjectId;
        });
      }

      // Filter by userId if provided
      if (userId) {
        const numericUserId =
          typeof userId === "string" ? parseInt(userId, 10) : Number(userId);
        applications = applications.filter((a) =>
          a.studentIds.includes(numericUserId)
        );
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

      const collection = await getCollection<ApplicationI>("applications");

      // Build query filter
      const filter: Record<string, unknown> = {};
      if (projectId) {
        const projectIdNum =
          typeof projectId === "string" && !isNaN(Number(projectId))
            ? Number(projectId)
            : projectId;
        filter.projectId = projectIdNum;
      }
      if (userId) {
        const userIdNum =
          typeof userId === "string" && !isNaN(Number(userId))
            ? Number(userId)
            : userId;
        filter.studentIds = userIdNum;
      }

      // Query applications
      const dbApplications = await collection.find(filter).toArray();

      // Convert MongoDB ObjectId to string and ensure id field exists
      applications = dbApplications.map((app) => ({
        ...app,
        id:
          app.id ||
          (app._id ? parseInt(app._id.toString().slice(-8), 16) : Date.now()),
        _id: app._id?.toString(),
      })) as ApplicationI[];
    }

    // Apply filters for mock mode (already filtered in MongoDB mode)
    if (useMock) {
      if (projectId) {
        const projectIdNum = Number(projectId);
        applications = applications.filter((a) => a.projectId === projectIdNum);
      }
      if (userId) {
        const userIdNum = Number(userId);
        applications = applications.filter((a) =>
          a.studentIds.includes(userIdNum)
        );
      }
    }

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch applications: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Create a new application
 * Saves to mock JSON file if in mock mode, otherwise saves to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = getUseMockData();

    // Add timestamps
    const applicationData: Omit<ApplicationI, "id"> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let createdApplication: ApplicationI;

    if (useMock) {
      // Mock mode: Save to JSON file
      createdApplication = await createItem<ApplicationI>(
        "mockApplications.json",
        applicationData
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

      const collection = await getCollection<ApplicationI>("applications");

      // Generate numeric ID if not provided (use timestamp-based ID)
      let applicationId = body.id;
      if (!applicationId || isNaN(Number(applicationId))) {
        // Generate a numeric ID based on timestamp (ensures uniqueness)
        applicationId = Date.now();
      }

      // Add ID to application
      const newApplication: ApplicationI = {
        ...applicationData,
        id: Number(applicationId),
      };

      // Insert application
      const result = await collection.insertOne(newApplication);

      // Fetch the created application
      const fetchedApplication = await collection.findOne({
        _id: result.insertedId,
      });

      if (!fetchedApplication) {
        throw new Error("Failed to create application");
      }

      createdApplication = {
        ...fetchedApplication,
        id: fetchedApplication.id || Number(applicationId),
      } as ApplicationI;
    }

    // Return application (with _id for MongoDB compatibility)
    const response = {
      ...createdApplication,
    };

    if ("_id" in createdApplication && createdApplication._id) {
      (response as any)._id = createdApplication._id.toString();
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create application: ${errorMessage}` },
      { status: 500 }
    );
  }
}
