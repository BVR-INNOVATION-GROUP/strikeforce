"use client";

import React, { useState, useEffect } from "react";
import OfferStatsCards from "@/src/components/screen/university-admin/OfferStatsCards";
import IssueOfferModal from "@/src/components/screen/university-admin/IssueOfferModal";
import ApplicationOfferDetailsModal from "@/src/components/screen/university-admin/offers/ApplicationOfferDetailsModal";
import { useUniversityAdminOffers } from "@/src/hooks/useUniversityAdminOffers";
import ApplicationOfferCard from "@/src/components/screen/university-admin/offers/ApplicationOfferCard";
import { ApplicationI } from "@/src/models/application";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";
import { userRepository } from "@/src/repositories/userRepository";
import { groupRepository } from "@/src/repositories/groupRepository";
import { useAuthStore } from "@/src/store";
import DashboardLoading from "@/src/components/core/DashboardLoading";

/**
 * University Admin Offers - issue offers to shortlisted applications
 * Assignment happens automatically when students accept offers
 */
export default function UniversityAdminOffers() {
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [groups, setGroups] = useState<Record<string, GroupI>>({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationI | null>(null);

  const { user, organization } = useAuthStore();
  const universityId =
    organization?.id ??
    (user?.role === "university-admin" ? user?.orgId : user?.universityId) ??
    null;

  const {
    applications,
    projects,
    selectedApplication,
    isOfferModalOpen,
    offerExpiry,
    loading,
    errors,
    setOfferExpiry,
    handleIssueOffer,
    handleSendOffer,
    resetForm,
  } = useUniversityAdminOffers(universityId);

  /**
   * Load users and groups data for avatars from backend
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [usersList, groupsList] = await Promise.all([
          userRepository.getAll(),
          groupRepository.getAll(),
        ]);
        
        const usersMap: Record<string, UserI> = {};
        usersList.forEach((user) => {
          usersMap[user.id.toString()] = user;
        });
        setUsers(usersMap);

        const groupsMap: Record<string, GroupI> = {};
        groupsList.forEach((group) => {
          groupsMap[group.id.toString()] = group;
        });
        setGroups(groupsMap);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    loadUserData();
  }, []);

  /**
   * Get students for an application
   */
  const getStudentsForApplication = (application: ApplicationI): UserI[] => {
    if (application.applicantType === "GROUP" && application.groupId) {
      const group = groups[application.groupId.toString()];
      if (group) {
        const memberIds = [...(group.memberIds || []), group.leaderId].filter(Boolean);
        return memberIds.map((id) => users[id.toString()]).filter(Boolean);
      }
    } else {
      return application.studentIds.map((id) => users[id.toString()]).filter(Boolean);
    }
    return [];
  };

  /**
   * Get group for an application
   */
  const getGroupForApplication = (application: ApplicationI): GroupI | undefined => {
    if (application.applicantType === "GROUP" && application.groupId) {
      return groups[application.groupId.toString()];
    }
    return undefined;
  };

  /**
   * Open details modal
   */
  const handleViewDetails = (application: ApplicationI) => {
    setSelectedApplicationForDetails(application);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Offers</h1>
        <p className="text-[0.875rem] opacity-60">Issue offers to shortlisted applications. Once accepted, assignments are automatically created.</p>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <OfferStatsCards applications={applications} />
      </div>

      {/* Applications Grid */}
      {applications.filter((a) =>
        ["SHORTLISTED", "OFFERED", "ACCEPTED", "ASSIGNED"].includes(a.status)
      ).length === 0 ? (
        <div className="text-center py-12 bg-paper rounded-lg">
          <p className="text-[0.875rem] opacity-60">No applications ready for offers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications
            .filter((a) =>
              ["SHORTLISTED", "OFFERED", "ACCEPTED", "ASSIGNED"].includes(a.status)
            )
            .map((application) => (
              <ApplicationOfferCard
                key={application.id}
                application={application}
                project={projects[application.projectId.toString()]}
                onIssueOffer={handleIssueOffer}
                onViewDetails={handleViewDetails}
              />
            ))}
        </div>
      )}

      {/* Issue Offer Modal */}
      <IssueOfferModal
        open={isOfferModalOpen}
        application={selectedApplication}
        projects={projects}
        offerExpiry={offerExpiry}
        errors={errors}
        onClose={resetForm}
        onExpiryChange={(value) => {
          setOfferExpiry(value);
        }}
        onClearError={() => {}}
        onSubmit={handleSendOffer}
      />

      {/* Details Modal */}
      <ApplicationOfferDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplicationForDetails(null);
        }}
        application={selectedApplicationForDetails}
        project={selectedApplicationForDetails ? projects[selectedApplicationForDetails.projectId.toString()] : undefined}
        students={selectedApplicationForDetails ? getStudentsForApplication(selectedApplicationForDetails) : []}
        group={selectedApplicationForDetails ? getGroupForApplication(selectedApplicationForDetails) : undefined}
        onIssueOffer={handleIssueOffer}
      />
    </div>
  );
}

