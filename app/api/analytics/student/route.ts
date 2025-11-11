/**
 * API Route: GET /api/analytics/student
 * Student analytics dashboard statistics
 */
import { NextRequest, NextResponse } from "next/server";
import { dashboardService } from "@/src/services/dashboardService";

/**
 * GET /api/analytics/student?studentId=xxx
 * Get student dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Missing required parameter: studentId" },
        { status: 400 }
      );
    }

    const stats = await dashboardService.getStudentDashboardStats(studentId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch student analytics: ${errorMessage}` },
      { status: 500 }
    );
  }
}



