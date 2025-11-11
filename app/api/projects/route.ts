/**
 * API Route: GET /api/projects, POST /api/projects
 * Handles project CRUD operations with MongoDB or mock JSON files
 */
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/src/lib/mongodb";
import { ProjectI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  writeMockDataFile,
  createItem,
} from "@/src/utils/fileHelpers.server";
import { ObjectId } from "mongodb";

/**
 * GET /api/projects
 * Retrieve all projects (with optional filters)
 * Returns from mock JSON file if in mock mode, otherwise from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partnerId");
    const universityId = searchParams.get("universityId");
    const useMock = getUseMockData();

    let projects: ProjectI[];

    if (useMock) {
      // Mock mode: Read from JSON file
      projects = await readMockDataFileServer<ProjectI>("mockProjects.json");
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

      const collection = await getCollection<ProjectI>("projects");

      // Build query filter
      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (partnerId) {
        // Convert partnerId to number if it's a string (for consistency with numeric IDs)
        filter.partnerId =
          typeof partnerId === "string" && !isNaN(Number(partnerId))
            ? Number(partnerId)
            : partnerId;
      }
      if (universityId) {
        // Convert universityId to number if it's a string
        filter.universityId =
          typeof universityId === "string" && !isNaN(Number(universityId))
            ? Number(universityId)
            : universityId;
      }

      // Query projects
      const dbProjects = await collection.find(filter).toArray();

      // Convert MongoDB ObjectId to string and ensure id field exists
      projects = dbProjects.map((project) => ({
        ...project,
        id:
          project.id ||
          (project._id
            ? parseInt(project._id.toString().slice(-8), 16)
            : Date.now()),
        _id: project._id?.toString(),
      })) as ProjectI[];
    }

    // Apply filters for mock mode (already filtered in MongoDB mode)
    if (useMock) {
      if (status) {
        projects = projects.filter((p) => p.status === status);
      }
      if (partnerId) {
        const partnerIdNum = Number(partnerId);
        projects = projects.filter((p) => p.partnerId === partnerIdNum);
      }
      if (universityId) {
        const universityIdNum = Number(universityId);
        projects = projects.filter((p) => p.universityId === universityIdNum);
      }
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 * Saves to mock JSON file if in mock mode, otherwise saves to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = getUseMockData();

    // Add timestamps
    const projectData: Omit<ProjectI, "id"> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let createdProject: ProjectI;

    if (useMock) {
      // Mock mode: Save to JSON file
      createdProject = await createItem<ProjectI>(
        "mockProjects.json",
        projectData
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

      const collection = await getCollection<ProjectI>("projects");

      // Generate numeric ID if not provided (use timestamp-based ID)
      let projectId = body.id;
      if (!projectId || isNaN(Number(projectId))) {
        // Generate a numeric ID based on timestamp (ensures uniqueness)
        projectId = Date.now();
      }

      // Add ID to project
      const newProject: ProjectI = {
        ...projectData,
        id: Number(projectId),
      };

      // Insert project - remove the 'as unknown' cast
      const result = await collection.insertOne(newProject);

      // Fetch the created project
      const fetchedProject = await collection.findOne({
        _id: result.insertedId,
      });

      if (!fetchedProject) {
        throw new Error("Failed to create project");
      }

      createdProject = {
        ...fetchedProject,
        id: fetchedProject.id || Number(projectId),
      } as ProjectI;
    }

    // Return project (with _id for MongoDB compatibility)
    return NextResponse.json(
      {
        ...createdProject,
        _id: (createdProject as any)._id?.toString() || undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create project: ${errorMessage}` },
      { status: 500 }
    );
  }
}