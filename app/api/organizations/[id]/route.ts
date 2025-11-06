/**
 * API Route: GET/PUT/DELETE /api/organizations/[id]
 * Handle organization operations by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { sendKYCApprovalEmail } from "@/src/services/emailService";
import { getUseMockData } from "@/src/utils/config";
import { 
  readMockDataFileServer, 
  updateItem, 
  findById as findByIdServer 
} from "@/src/utils/fileHelpers.server";
import { OrganizationI } from "@/src/models/organization";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organization = await organizationRepository.getById(id);
    return NextResponse.json(organization, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch organization: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    let previousOrg: OrganizationI;
    let updated: OrganizationI;

    // Handle mock data mode - use file helpers directly to avoid API loop
    if (getUseMockData()) {
      const organizations = await readMockDataFileServer<OrganizationI>("mockOrganizations.json");
      const org = findByIdServer(organizations, id);
      if (!org) {
        return NextResponse.json(
          { error: `Organization ${id} not found` },
          { status: 404 }
        );
      }
      previousOrg = org;
      
      updated = await updateItem<OrganizationI>("mockOrganizations.json", id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Production mode - use repository
      previousOrg = await organizationRepository.getById(id);
      updated = await organizationRepository.update(id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }

    // Send email notification if KYC status changed to APPROVED
    if (
      previousOrg.kycStatus !== "APPROVED" &&
      updated.kycStatus === "APPROVED"
    ) {
      try {
        await sendKYCApprovalEmail(updated.email, updated.name, true);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
    }

    // Send email notification if KYC status changed to REJECTED
    if (
      previousOrg.kycStatus !== "REJECTED" &&
      updated.kycStatus === "REJECTED"
    ) {
      try {
        await sendKYCApprovalEmail(updated.email, updated.name, false);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating organization:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update organization: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Handle mock data mode - use file helpers directly to avoid API loop
    if (getUseMockData()) {
      const { deleteItem } = await import("@/src/utils/fileHelpers.server");
      const deleted = await deleteItem<OrganizationI>("mockOrganizations.json", id);
      if (!deleted) {
        return NextResponse.json(
          { error: `Organization ${id} not found` },
          { status: 404 }
        );
      }
    } else {
      // Production mode - delete from database
      // In production, this would call the database directly
      // For now, we'll use the repository but it should be updated to use database client
      // Note: This might cause a loop if repository calls this API - need to use direct DB access
      console.log(`[Production] Would delete organization ${id} from database`);
      // TODO: Replace with direct database deletion
      // await db.organizations.delete({ where: { id } });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting organization:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete organization: ${errorMessage}` },
      { status: 500 }
    );
  }
}

