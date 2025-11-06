/**
 * API Route: GET /api/projects, POST /api/projects
 * Handles project CRUD operations with MongoDB
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/src/lib/mongodb';
import { ProjectI } from '@/src/models/project';

/**
 * GET /api/projects
 * Retrieve all projects (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const partnerId = searchParams.get('partnerId');
    const universityId = searchParams.get('universityId');

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not configured. Please set it in your .env file.');
      return NextResponse.json(
        { error: 'Database not configured. Please set MONGODB_URI in your .env file.' },
        { status: 500 }
      );
    }

    const collection = await getCollection<ProjectI>('projects');

    // Build query filter
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (partnerId) {
      // Convert partnerId to number if it's a string (for consistency with numeric IDs)
      filter.partnerId = typeof partnerId === 'string' && !isNaN(Number(partnerId)) 
        ? Number(partnerId) 
        : partnerId;
    }
    if (universityId) {
      // Convert universityId to number if it's a string
      filter.universityId = typeof universityId === 'string' && !isNaN(Number(universityId))
        ? Number(universityId)
        : universityId;
    }

    // Query projects
    const projects = await collection.find(filter).toArray();

    // Convert MongoDB ObjectId to string for JSON serialization
    const projectsWithStringIds = projects.map((project) => ({
      ...project,
      _id: project._id?.toString(),
    }));

    return NextResponse.json(projectsWithStringIds, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection<ProjectI>('projects');

    // Add timestamps
    const newProject: ProjectI = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert project
    const result = await collection.insertOne(newProject);

    // Fetch the created project
    const createdProject = await collection.findOne({
      _id: result.insertedId,
    });

    if (!createdProject) {
      throw new Error('Failed to create project');
    }

    return NextResponse.json(
      {
        ...createdProject,
        _id: createdProject._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

