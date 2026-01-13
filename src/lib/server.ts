// @/src/models/backendUser.ts
import { UserI, UserRole, UserProfileI } from "@/src/models/user";
import { OrganizationI, OrganizationType, KycStatus } from "@/src/models/organization";

export interface BackendUserProfile {
  avatar: string;
  bio: string;
  skills: string[] | null;
  phone: string;
  location: string;
}

export interface BackendUser {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  role: string;
  email: string;
  name: string;
  password: string;
  profile: BackendUserProfile;
  groups: unknown[] | null; // Keep as unknown if structure is unclear
  // Add these if your backend returns them
  orgId?: number;
  universityId?: number;
  departmentId?: number;
  courseId?: number;
}

export interface BackendOrganization {
  id: number;
  name: string;
  type: string;
  email?: string;
  kycStatus: string;
  isApproved?: boolean;
  logo?: string;
  website?: string;
  brandColor?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendLoginResponse {
  token: string;
  user: BackendUser;
  organization?: BackendOrganization;
  isFirstLogin?: boolean; // For students - indicates if they need to complete DNA snapshot
}

/**
 * Maps backend user format to frontend UserI interface
 */
export function mapBackendUserToFrontend(backendUser: BackendUser): UserI {
  // Transform profile
  const profile: UserProfileI = {
    avatar: backendUser.profile.avatar || undefined,
    bio: backendUser.profile.bio || undefined,
    skills: backendUser.profile.skills || undefined,
    phone: backendUser.profile.phone || undefined,
    location: backendUser.profile.location || undefined,
    portfolioItems: undefined, // Add if backend provides this
  };

  return {
    id: backendUser.ID,
    role: backendUser.role as UserRole, // Type assertion - ensure backend returns valid roles
    email: backendUser.email,
    name: backendUser.name,
    profile,
    orgId: backendUser.orgId,
    universityId: backendUser.universityId,
    departmentId: backendUser.departmentId,
    courseId: backendUser.courseId,
    createdAt: backendUser.CreatedAt,
    updatedAt: backendUser.UpdatedAt,
    // Don't include password in frontend user object
  };
}

export function mapBackendOrganizationToFrontend(
  backendOrganization: BackendOrganization
): OrganizationI {
  const normalizedType = backendOrganization.type?.toUpperCase();
  const resolvedType: OrganizationType =
    normalizedType === "UNIVERSITY" ? "UNIVERSITY" : "PARTNER";

  const normalizedStatus = backendOrganization.kycStatus?.toUpperCase();
  const resolvedStatus: KycStatus =
    normalizedStatus === "APPROVED"
      ? "APPROVED"
      : normalizedStatus === "REJECTED"
        ? "REJECTED"
        : normalizedStatus === "EXPIRED"
          ? "EXPIRED"
          : "PENDING";

  return {
    id: backendOrganization.id,
    type: resolvedType,
    name: backendOrganization.name,
    email: backendOrganization.email || "",
    kycStatus: resolvedStatus,
    logo: backendOrganization.logo,
    website: backendOrganization.website,
    brandColor: backendOrganization.brandColor,
    address: backendOrganization.address,
    billingProfile: undefined,
    createdAt: backendOrganization.createdAt,
    updatedAt: backendOrganization.updatedAt,
  };
}
