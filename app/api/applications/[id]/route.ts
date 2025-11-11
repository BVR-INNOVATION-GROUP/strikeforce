/**
 * API Route: GET /api/applications/[id], PUT /api/applications/[id], DELETE /api/applications/[id]
 * Handles individual application operations
 */
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/src/lib/mongodb";
import { ApplicationI } from "@/src/models/application";
import { getUseMockData } from "@/src/utils/config";
import {
  readMockDataFileServer,
  writeMockDataFile,
  findById,
  findIndexById,
} from "@/src/utils/fileHelpers.server";

/**
 * GET /api/applications/[id]
 * Get application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useMock = getUseMockData();

    let application: ApplicationI;

    if (useMock) {
      const applications = await readMockDataFileServer<ApplicationI>(
        "mockApplications.json"
      );
      const found = findById(applications, id);
      if (!found) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }
      application = found;
    } else {
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      const collection = await getCollection<ApplicationI>("applications");
      const numericId = Number(id);
      const found = await collection.findOne({ id: numericId });

      if (!found) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }

      application = {
        ...found,
        id: found.id || numericId,
        _id: found._id?.toString(),
      } as ApplicationI;
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/applications/[id]
 * Update application
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const useMock = getUseMockData();

    if (useMock) {
      const applications = await readMockDataFileServer<ApplicationI>(
        "mockApplications.json"
      );
      const index = findIndexById(applications, id);

      if (index === -1) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }

      const updated: ApplicationI = {
        ...applications[index],
        ...body,
        id: applications[index].id,
        updatedAt: new Date().toISOString(),
      };

      applications[index] = updated;
      await writeMockDataFile("mockApplications.json", applications);

      return NextResponse.json(updated, { status: 200 });
    } else {
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      const collection = await getCollection<ApplicationI>("applications");
      const numericId = Number(id);

      const updated: ApplicationI = {
        ...body,
        id: numericId,
        updatedAt: new Date().toISOString(),
      };

      await collection.updateOne(
        { id: numericId },
        {
          $set: updated,
        }
      );

      const fetched = await collection.findOne({ id: numericId });
      if (!fetched) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          ...fetched,
          id: fetched.id || numericId,
          _id: fetched._id?.toString(),
        } as ApplicationI,
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useMock = getUseMockData();

    if (useMock) {
      const applications = await readMockDataFileServer<ApplicationI>(
        "mockApplications.json"
      );
      const index = findIndexById(applications, id);

      if (index === -1) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }

      applications.splice(index, 1);
      await writeMockDataFile("mockApplications.json", applications);

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      const collection = await getCollection<ApplicationI>("applications");
      const numericId = Number(id);

      const result = await collection.deleteOne({ id: numericId });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: `Application ${id} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
