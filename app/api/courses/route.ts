/**
 * API Route: GET/POST /api/courses
 * Handle course operations with MongoDB integration
 */
import { NextRequest, NextResponse } from "next/server";
import { CourseI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import {
  createItem,
  readMockDataFileServer,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/courses
 * Get all courses, optionally filtered by departmentId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    if (getUseMockData()) {
      // Mock mode: Use JSON files
      const courses = await readMockDataFileServer<CourseI>("mockCourses.json");

      if (departmentId) {
        const numericDepartmentId = parseInt(departmentId, 10);
        const filtered = courses.filter(
          (c) => c.departmentId === numericDepartmentId
        );
        return NextResponse.json(filtered, { status: 200 });
      }

      return NextResponse.json(courses, { status: 200 });
    }

    // Production mode: Use MongoDB
    // Dynamically import MongoDB to avoid module-level errors
    let collection;
    try {
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

      const { getCollection } = await import("@/src/lib/mongodb");
      collection = await getCollection<CourseI>("courses");
    } catch (dbError) {
      console.error("Error connecting to MongoDB:", dbError);
      const errorMessage =
        dbError instanceof Error ? dbError.message : "Unknown database error";
      return NextResponse.json(
        { error: `Database connection failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Build query filter
    const filter: Record<string, unknown> = {};
    if (departmentId) {
      const numericDepartmentId = parseInt(departmentId, 10);
      if (!isNaN(numericDepartmentId)) {
        filter.departmentId = numericDepartmentId;
      }
    }

    // Query courses
    const courses = await collection.find(filter).toArray();

    // Convert MongoDB ObjectId to string for JSON serialization
    const coursesWithStringIds = courses.map((course) => ({
      ...course,
      _id: course._id?.toString(),
      id: course.id || course._id?.toString(),
    }));

    return NextResponse.json(coursesWithStringIds, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch courses: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, departmentId } = body;

    // Validate required fields
    if (!name || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields: name, departmentId" },
        { status: 400 }
      );
    }

    // Validate name is not empty
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Course name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate departmentId is a number
    const numericDepartmentId =
      typeof departmentId === "string"
        ? parseInt(departmentId, 10)
        : departmentId;
    if (isNaN(numericDepartmentId)) {
      return NextResponse.json(
        { error: "Department ID must be a valid number" },
        { status: 400 }
      );
    }

    // Create course
    let course: CourseI;

    if (getUseMockData()) {
      // Check for duplicate name within the same department
      const existingCourses = await readMockDataFileServer<CourseI>(
        "mockCourses.json"
      );
      const duplicate = existingCourses.find(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase().trim() &&
          c.departmentId === numericDepartmentId
      );

      if (duplicate) {
        return NextResponse.json(
          {
            error: "A course with this name already exists for this department",
          },
          { status: 409 }
        );
      }

      course = await createItem<CourseI>("mockCourses.json", {
        name: name.trim(),
        departmentId: numericDepartmentId,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Production mode: Use MongoDB
      if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not configured");
        return NextResponse.json(
          {
            error:
              "Database not configured. Please set MONGODB_URI in your .env file.",
          },
          { status: 500 }
        );
      }

      // Dynamically import MongoDB to avoid module-level errors
      let collection;
      try {
        // Check if MONGODB_URI is set before importing
        if (!process.env.MONGODB_URI) {
          return NextResponse.json(
            {
              error:
                "Database not configured. Please set MONGODB_URI in your .env file.",
            },
            { status: 500 }
          );
        }

        const { getCollection } = await import("@/src/lib/mongodb");
        collection = await getCollection<CourseI>("courses");
      } catch (dbError) {
        console.error("Error connecting to MongoDB:", dbError);
        const errorMessage =
          dbError instanceof Error ? dbError.message : "Unknown database error";
        return NextResponse.json(
          { error: `Database connection failed: ${errorMessage}` },
          { status: 500 }
        );
      }

      try {
        // Check for duplicate name within the same department
        const duplicate = await collection.findOne({
          name: name.trim(),
          departmentId: numericDepartmentId,
        });

        if (duplicate) {
          return NextResponse.json(
            {
              error:
                "A course with this name already exists for this department",
            },
            { status: 409 }
          );
        }

        // Create new course
        const newCourse: Omit<CourseI, "id"> = {
          name: name.trim(),
          departmentId: numericDepartmentId,
          createdAt: new Date().toISOString(),
        };

        const result = await collection.insertOne(
          newCourse as unknown as CourseI
        );

        // Fetch the created course
        const createdCourse = await collection.findOne({
          _id: result.insertedId,
        });
        if (!createdCourse) {
          throw new Error("Failed to retrieve created course");
        }

        course = {
          ...createdCourse,
          id:
            createdCourse.id ||
            createdCourse._id?.toString() ||
            result.insertedId.toString(),
        } as CourseI;
      } catch (dbError) {
        console.error("Error creating course in MongoDB:", dbError);
        const errorMessage =
          dbError instanceof Error ? dbError.message : "Unknown database error";
        return NextResponse.json(
          { error: `Failed to create course in database: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Always return JSON, never HTML
    return NextResponse.json(
      {
        error: `Failed to create course: ${errorMessage}`,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
