/**
 * Custom hook for partner profile data management
 */
import { useState, useEffect } from "react";
import { userProfileService } from "@/src/services/userProfileService";
import { organizationService } from "@/src/services/organizationService";
import { kycService } from "@/src/services/kycService";
import { UserI } from "@/src/models/user";
import { KycDocumentI } from "@/src/models/kyc";
import { ProfileFormData } from "@/src/components/screen/partner/profile/ProfileForm";

export interface OrganizationInfo {
  name: string;
  type: string;
  kycStatus: string;
}

export interface UsePartnerProfileDataResult {
  formData: ProfileFormData;
  organizationInfo: OrganizationInfo | null;
  documents: KycDocumentI[];
  loading: boolean;
  refreshDocuments: () => Promise<void>;
}

/**
 * Hook for managing partner profile data
 */
export function usePartnerProfileData(
  user: UserI | null
): UsePartnerProfileDataResult {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
  });
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo | null>(null);
  const [documents, setDocuments] = useState<KycDocumentI[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshDocuments = async () => {
    if (user?.orgId) {
      const kycDocs = await kycService.getOrgDocuments(user.orgId);
      setDocuments(kycDocs);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          const [profile, orgInfo] = await Promise.all([
            userProfileService.getProfile(user.id),
            user.orgId
              ? organizationService.getOrganizationInfo(user.orgId)
              : null,
          ]);

          setFormData({
            name: profile.name,
            email: profile.email,
            bio: profile.profile.bio || "",
            phone: profile.profile.phone || "",
            location: profile.profile.location || "",
          });

          if (orgInfo) {
            setOrganizationInfo(orgInfo);
          }

          if (user.orgId) {
            await refreshDocuments();
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return {
    formData,
    organizationInfo,
    documents,
    loading,
    refreshDocuments,
  };
}






