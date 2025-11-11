/**
 * API Route: POST /api/organizations
 * Create a new organization (Partner or University)
 * PRD Reference: Section 4 - Organizations sign up → submit KYC
 */
import { NextRequest, NextResponse } from "next/server";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";
import { UserI, UserRole } from "@/src/models/user";
import { getUseMockData } from "@/src/utils/config";
import { createItem, updateItem } from "@/src/utils/fileHelpers.server";
import {
  sendOrganizationRegistrationEmail,
  sendOrganizationInvitationEmail,
} from "@/src/services/emailService";
import { generateSecurePassword } from "@/src/utils/passwordGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      email,
      kycStatus = "PENDING",
      billingProfile,
      description,
    } = body;

    // Validate required fields
    if (!name || !type || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, email" },
        { status: 400 }
      );
    }

    if (type !== "PARTNER" && type !== "UNIVERSITY") {
      return NextResponse.json(
        { error: "Invalid organization type. Must be PARTNER or UNIVERSITY" },
        { status: 400 }
      );
    }

    // Create organization
    let organization: OrganizationI;

    // Prepare billing profile with orgId (will be set after creation)
    const billingProfileData = billingProfile
      ? {
          ...billingProfile,
          orgId: 0, // Temporary, will be updated after creation
        }
      : undefined;

    // Handle mock data mode - use file helpers directly to avoid API loop
    if (getUseMockData()) {
      organization = await createItem<OrganizationI>("mockOrganizations.json", {
        name,
        type,
        email,
        kycStatus,
        billingProfile: billingProfileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Omit<OrganizationI, "id">);

      // Update billingProfile.orgId with the created organization's ID
      if (billingProfileData && organization.id) {
        organization.billingProfile = {
          ...billingProfileData,
          orgId: organization.id,
        };
        // Update the organization with correct orgId
        const { updateItem } = await import("@/src/utils/fileHelpers.server");
        await updateItem<OrganizationI>(
          "mockOrganizations.json",
          organization.id,
          {
            billingProfile: organization.billingProfile,
          }
        );
      }
    } else {
      // Production mode - use repository
      organization = await organizationRepository.create({
        name,
        type,
        email,
        kycStatus,
        billingProfile: billingProfileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Partial<OrganizationI>);

      // Update billingProfile.orgId with the created organization's ID
      if (billingProfileData && organization.id) {
        organization.billingProfile = {
          ...billingProfileData,
          orgId: organization.id,
        };
        // Update the organization with correct orgId
        await organizationRepository.update(organization.id, {
          billingProfile: organization.billingProfile,
        });
      }
    }

    // If organization is pre-approved (created by super admin), create user account and send invitation
    if (kycStatus === "APPROVED") {
      try {
        // Generate secure password for the organization admin
        const password = generateSecurePassword(12);

        // Determine user role based on organization type
        const userRole: UserRole =
          type === "PARTNER" ? "partner" : "university-admin";

        // Create user account for the organization admin
        if (getUseMockData()) {
          // Create user in mock data with password stored in user object
          const contactName = billingProfile?.contactName || name;
          const newUser = await createItem<UserI>("mockUsers.json", {
            role: userRole,
            email: email.toLowerCase().trim(),
            name: contactName,
            password: password, // Store password in user data
            orgId: organization.id,
            profile: {
              avatar: undefined,
              bio: `${type} administrator for ${name}`,
              skills: [],
              phone: billingProfile?.phone,
              location: billingProfile?.address,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Omit<UserI, "id">);

          // Password is stored in user object, no need for separate credentials file
        } else {
          // Production mode - create user via API/repository
          // In production, this would create the user in the database
          // and store the hashed password securely
          console.log(
            `[Production] Would create user account for ${email} with role ${userRole}`
          );
        }

        // Send invitation email with credentials
        await sendOrganizationInvitationEmail(email, name, password, userRole);
      } catch (userError) {
        // Log but don't fail the request if user creation/email fails
        console.error(
          "Failed to create user account or send invitation email:",
          userError
        );
      }
    } else if (kycStatus === "PENDING") {
      // Create user account and send registration email with credentials for self-registered organizations
      try {
        // Generate secure password for the organization admin
        const password = generateSecurePassword(12);

        // Determine user role based on organization type
        const userRole: UserRole =
          type === "PARTNER" ? "partner" : "university-admin";

        // Create user account for the organization admin
        if (getUseMockData()) {
          // Create user in mock data with password stored in user object
          const contactName = billingProfile?.contactName || name;
          const newUser = await createItem<UserI>("mockUsers.json", {
            role: userRole,
            email: email.toLowerCase().trim(),
            name: contactName,
            password: password, // Store password in user data
            orgId: organization.id,
            profile: {
              avatar: undefined,
              bio: `${type} administrator for ${name}`,
              skills: [],
              phone: billingProfile?.phone,
              location: billingProfile?.address,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Omit<UserI, "id">);

          // Password is stored in user object, no need for separate credentials file
        } else {
          // Production mode - create user via API/repository
          // In production, this would create the user in the database
          // and store the hashed password securely
          console.log(
            `[Production] Would create user account for ${email} with role ${userRole}`
          );
        }

        // Send registration email with credentials
        await sendOrganizationRegistrationEmail(
          email,
          name,
          password,
          userRole
        );
      } catch (userError) {
        // Log but don't fail the request if user creation/email fails
        console.error(
          "Failed to create user account or send registration email:",
          userError
        );
      }
    }

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create organization: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const organizations = await organizationRepository.getAll();
    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch organizations: ${errorMessage}` },
      { status: 500 }
    );
  }
}
