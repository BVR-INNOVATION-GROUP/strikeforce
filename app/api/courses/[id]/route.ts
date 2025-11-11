/**
 * API Route: GET/PUT/DELETE /api/courses/[id]
 * Handle course operations by ID with MongoDB integration
 */
import { NextRequest, NextResponse } from "next/server";
import { CourseI } from "@/src/models/project";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  updateItem,
  deleteItem,
  findById as findByIdServer,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/courses/[id]
 * Get course by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (getUseMockData()) {
      // Mock mode: Use JSON files
      const courses = await readMockDataFileServer<CourseI>("mockCourses.json");
      const course = findByIdServer(courses, id);

      if (!course) {
        return NextResponse.json(
          { error: `Course ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(course, { status: 200 });
    }

    // Production mode: Use MongoDB
    // Dynamically import MongoDB to avoid module-level errors
    let collection;
    try {
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
      // Convert id to number if it's numeric
      const numericId = !isNaN(Number(id)) ? Number(id) : null;

      // Try to find by id field first (if numeric)
      let course =
        numericId !== null ? await collection.findOne({ id: numericId }) : null;

      if (!course) {
        // Try MongoDB ObjectId
        try {
          const { ObjectId } = await import("mongodb");
          if (ObjectId.isValid(id)) {
            course = await collection.findOne({
              _id: new ObjectId(id),
            });
          }
        } catch (e) {
          // Ignore ObjectId errors
        }
      }

      if (!course) {
        return NextResponse.json(
          { error: `Course ${id} not found` },
          { status: 404 }
        );
      }

      // Convert MongoDB ObjectId to string
      const courseWithStringId = {
        ...course,
        _id: course._id?.toString(),
        id: course.id || course._id?.toString(),
      };

      return NextResponse.json(courseWithStringId, { status: 200 });
    } catch (dbError) {
      console.error("Error fetching course from MongoDB:", dbError);
      const errorMessage =
        dbError instanceof Error ? dbError.message : "Unknown database error";
      return NextResponse.json(
        { error: `Failed to fetch course from database: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch course: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Course name cannot be empty" },
          { status: 400 }
        );
      }
    }

    // Validate departmentId if provided
    if (body.departmentId !== undefined) {
      const numericDepartmentId =
        typeof body.departmentId === "string"
          ? parseInt(body.departmentId, 10)
          : body.departmentId;
      if (isNaN(numericDepartmentId)) {
        return NextResponse.json(
          { error: "Department ID must be a valid number" },
          { status: 400 }
        );
      }
      body.departmentId = numericDepartmentId;
    }

    let updated: CourseI;

    if (getUseMockData()) {
      // Mock mode: Use JSON files
      const courses = await readMockDataFileServer<CourseI>("mockCourses.json");
      const existing = findByIdServer(courses, id);

      if (!existing) {
        return NextResponse.json(
          { error: `Course ${id} not found` },
          { status: 404 }
        );
      }

      // Check for duplicate name if name is being updated
      if (
        body.name &&
        body.name.trim().toLowerCase() !== existing.name.toLowerCase()
      ) {
        const duplicate = courses.find(
          (c) =>
            c.id !== existing.id &&
            c.name.toLowerCase() === body.name.toLowerCase().trim() &&
            c.departmentId === (body.departmentId || existing.departmentId)
        );

        if (duplicate) {
          return NextResponse.json(
            {
              error:
                "A course with this name already exists for this department",
            },
            { status: 409 }
          );
        }
      }

      updated = await updateItem<CourseI>("mockCourses.json", id, {
        ...body,
        name: body.name ? body.name.trim() : existing.name,
      });
    } else {
      // Production mode: Use MongoDB
      // Dynamically import MongoDB to avoid module-level errors
      let collection;
      try {
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
        // Convert id to number if it's numeric
        const numericId = !isNaN(Number(id)) ? Number(id) : null;

        // Try to find by id field first (if numeric)
        let existing =
          numericId !== null
            ? await collection.findOne({ id: numericId })
            : null;

        if (!existing) {
          // Try MongoDB ObjectId
          try {
            const { ObjectId } = await import("mongodb");
            if (ObjectId.isValid(id)) {
              existing = await collection.findOne({
                _id: new ObjectId(id),
              });
            }
          } catch (e) {
            // Ignore ObjectId errors
          }
        }

        if (!existing) {
          return NextResponse.json(
            { error: `Course ${id} not found` },
            { status: 404 }
          );
        }

        // Check for duplicate name if name is being updated
        if (
          body.name &&
          body.name.trim().toLowerCase() !== existing.name.toLowerCase()
        ) {
          const duplicate = await collection.findOne({
            name: body.name.trim(),
            departmentId: body.departmentId || existing.departmentId,
          });

          if (
            duplicate &&
            duplicate._id?.toString() !== existing._id?.toString()
          ) {
            return NextResponse.json(
              {
                error:
                  "A course with this name already exists for this department",
              },
              { status: 409 }
            );
          }
        }

        // Prepare update data
        const updateData: Partial<CourseI> = {
          ...body,
          name: body.name ? body.name.trim() : existing.name,
        };

        // Update course
        const updateFilter = existing.id
          ? { id: existing.id }
          : { _id: existing._id };

        await collection.updateOne(updateFilter, {
          $set: updateData,
        });

        // Fetch updated course
        const updatedCourse = await collection.findOne(updateFilter);
        if (!updatedCourse) {
          throw new Error("Failed to retrieve updated course");
        }

        updated = {
          ...updatedCourse,
          id: updatedCourse.id || updatedCourse._id?.toString(),
        } as CourseI;
      } catch (dbError) {
        console.error("Error updating course in MongoDB:", dbError);
        const errorMessage =
          dbError instanceof Error ? dbError.message : "Unknown database error";
        return NextResponse.json(
          { error: `Failed to update course in database: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update course: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[DEBUG DELETE] Course ID to delete:", id, "Type:", typeof id);
    console.log("[DEBUG DELETE] Using mock data?", getUseMockData());

    if (getUseMockData()) {
      // Mock mode: Use JSON files for CRUD operations
      try {
        // deleteItem handles both string and number IDs
        const deleted = await deleteItem<CourseI>("mockCourses.json", id);

        if (!deleted) {
          console.log("[DEBUG DELETE] Course not found in mock data file");
          return NextResponse.json(
            { error: `Course ${id} not found` },
            { status: 404 }
          );
        }

        console.log(
          "[DEBUG DELETE] Course deleted successfully from mockCourses.json"
        );
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (fileError) {
        console.error(
          "[DEBUG DELETE] Error deleting from mock data file:",
          fileError
        );
        const errorMessage =
          fileError instanceof Error ? fileError.message : "Unknown file error";
        return NextResponse.json(
          { error: `Failed to delete course from file: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // Production mode: Use MongoDB
    // Dynamically import MongoDB to avoid module-level errors
    let collection;
    try {
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
      // Convert id to number if it's numeric
      const numericId = !isNaN(Number(id)) ? Number(id) : null;

      // Try to find by id field first (if numeric)
      let existing =
        numericId !== null ? await collection.findOne({ id: numericId }) : null;

      if (!existing) {
        // Try MongoDB ObjectId
        try {
          const { ObjectId } = await import("mongodb");
          if (ObjectId.isValid(id)) {
            existing = await collection.findOne({
              _id: new ObjectId(id),
            });
          }
        } catch (e) {
          // Ignore ObjectId errors
        }
      }

      if (!existing) {
        return NextResponse.json(
          { error: `Course ${id} not found` },
          { status: 404 }
        );
      }

      // Delete course
      const deleteFilter = existing.id
        ? { id: existing.id }
        : { _id: existing._id };

      const result = await collection.deleteOne(deleteFilter);

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: `Course ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (dbError) {
      console.error("Error deleting course in MongoDB:", dbError);
      const errorMessage =
        dbError instanceof Error ? dbError.message : "Unknown database error";
      return NextResponse.json(
        { error: `Failed to delete course in database: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting course:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Always return JSON, never HTML
    return NextResponse.json(
      {
        error: `Failed to delete course: ${errorMessage}`,
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
