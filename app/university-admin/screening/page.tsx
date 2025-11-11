"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import { ApplicationI } from "@/src/models/application";
import { ProjectI } from "@/src/models/project";
import { UserI } from "@/src/models/user";
import { GroupI } from "@/src/models/group";
import ScreeningApplicationCard from "@/src/components/screen/university-admin/screening/ScreeningApplicationCard";
import ScreeningApplicationDetailsModal from "@/src/components/screen/university-admin/screening/ScreeningApplicationDetailsModal";
import ScoreApplicationModal from "@/src/components/screen/university-admin/screening/ScoreApplicationModal";
import { useAuthStore } from "@/src/store";

/**
 * University Admin Screening - screen and score project applications
 */
export default function UniversityAdminScreening() {
  const { user, organization } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationI[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectI>>({});
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [groups, setGroups] = useState<Record<string, GroupI>>({});
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationI | null>(null);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationI | null>(null);

  /**
   * Load data from backend
   */
  const loadData = async () => {
    try {
      // For university-admin, use organization.id or user.orgId
      const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
      if (!universityId) {
        setLoading(false);
        return;
      }

      // Dynamically import services to avoid server/client mismatch
      const [
        { applicationRepository },
        { projectService },
        { userRepository },
        { groupRepository },
      ] = await Promise.all([
        import("@/src/repositories/applicationRepository"),
        import("@/src/services/projectService"),
        import("@/src/repositories/userRepository"),
        import("@/src/repositories/groupRepository"),
      ]);

      // Load all data from backend
      const [allApplications, allProjects, allUsers, allGroups] = await Promise.all([
        applicationRepository.getAll(),
        projectService.getAllProjects(),
        userRepository.getAll(),
        groupRepository.getAll(),
      ]);

      // Filter projects for this university
      const numericUniversityId = typeof universityId === 'string' ? parseInt(universityId, 10) : universityId;
      const universityProjects = allProjects.filter(
        (p) => {
          const projectUniId = typeof p.universityId === 'string' ? parseInt(p.universityId, 10) : p.universityId;
          return projectUniId === numericUniversityId;
        }
      );
      
      // Filter applications for university projects
      const universityProjectIds = new Set(universityProjects.map((p) => p.id.toString()));
      const universityApplications = allApplications.filter(
        (a) => universityProjectIds.has(a.projectId.toString())
      );
      setApplications(universityApplications);
      
      const projectsMap: Record<string, ProjectI> = {};
      universityProjects.forEach((p) => {
        projectsMap[p.id.toString()] = p;
      });
      setProjects(projectsMap);

      // Load users for avatars
      const usersMap: Record<string, UserI> = {};
      allUsers.forEach((user) => {
        usersMap[user.id.toString()] = user;
      });
      setUsers(usersMap);

      // Load groups for group applications
      const groupsMap: Record<string, GroupI> = {};
      allGroups.forEach((group) => {
        groupsMap[group.id.toString()] = group;
      });
      setGroups(groupsMap);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For university-admin, use organization.id or user.orgId
    const universityId = organization?.id || (user?.role === "university-admin" ? user?.orgId : user?.universityId);
    if (universityId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.orgId, user?.universityId, organization?.id]);

  /**
   * Open scoring modal for an application
   */
  const handleScoreClick = (application: ApplicationI) => {
    setSelectedApplication(application);
    setScoringModalOpen(true);
  };

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

  /**
   * Handle scoring submission - update application score (advisory)
   * Note: Scoring is advisory for supervisors/partners. Core actions are shortlist/reject/waitlist.
   */
  const handleScoreSubmit = async (applicationId: string, score: number) => {
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const numericAppId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      const app = applications.find(a => a.id.toString() === applicationId);
      if (!app) return;

      // Preserve existing score data or create new score structure
      const existingScore = app.score;
      const updatedApp = await applicationRepository.update(numericAppId, {
        score: {
          applicationId: app.id,
          autoScore: existingScore?.autoScore || 70,
          manualSupervisorScore: score,
          finalScore: score,
          skillMatch: existingScore?.skillMatch || 80,
          portfolioScore: existingScore?.portfolioScore || 75,
          ratingScore: existingScore?.ratingScore || 80,
          onTimeRate: existingScore?.onTimeRate || 0.85,
          reworkRate: existingScore?.reworkRate || 0.1,
        },
      });

      setApplications(
        applications.map((a) => (a.id === numericAppId ? updatedApp : a))
      );
      setScoringModalOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("Failed to update application score:", error);
    }
  };

  /**
   * Handle shortlist action - move application to SHORTLISTED status
   */
  const handleShortlist = async (applicationId: string) => {
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const numericAppId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      const updatedApp = await applicationRepository.update(numericAppId, {
        status: "SHORTLISTED",
        updatedAt: new Date().toISOString(),
      });
      setApplications(
        applications.map((a) => (a.id === numericAppId ? updatedApp : a))
      );
    } catch (error) {
      console.error("Failed to shortlist application:", error);
    }
  };

  /**
   * Handle reject action - move application to REJECTED status
   */
  const handleReject = async (applicationId: string) => {
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const numericAppId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      const updatedApp = await applicationRepository.update(numericAppId, {
        status: "REJECTED",
        updatedAt: new Date().toISOString(),
      });
      setApplications(
        applications.map((a) => (a.id === numericAppId ? updatedApp : a))
      );
    } catch (error) {
      console.error("Failed to reject application:", error);
    }
  };

  /**
   * Handle waitlist action - move application to WAITLIST status
   */
  const handleWaitlist = async (applicationId: string) => {
    try {
      const { applicationRepository } = await import("@/src/repositories/applicationRepository");
      const numericAppId = typeof applicationId === 'string' ? parseInt(applicationId, 10) : applicationId;
      const updatedApp = await applicationRepository.update(numericAppId, {
        status: "WAITLIST",
        updatedAt: new Date().toISOString(),
      });
      setApplications(
        applications.map((a) => (a.id === numericAppId ? updatedApp : a))
      );
    } catch (error) {
      console.error("Failed to waitlist application:", error);
    }
  };

  const filteredApplications =
    selectedBucket === "all"
      ? applications
      : applications.filter((app) => app.status === selectedBucket);

  const buckets = {
    all: applications.length,
    SUBMITTED: applications.filter((a) => a.status === "SUBMITTED").length,
    SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED").length,
    WAITLIST: applications.filter((a) => a.status === "WAITLIST").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full overflow-hidden p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-8">
        <h1 className="text-[1rem] font-[600] mb-2">Screening & Shortlisting</h1>
        <p className="text-[0.875rem] opacity-60">Review and manage project applications</p>
      </div>

      {/* Bucket Tabs */}
      <Card className="mb-8">
        <div className="flex gap-4 border-b border-custom mb-6 overflow-x-auto">
          {Object.entries(buckets).map(([bucket, count]) => (
            <button
              key={bucket}
              onClick={() => setSelectedBucket(bucket)}
              className={`pb-2 px-4 whitespace-nowrap ${
                selectedBucket === bucket
                  ? "border-b-2 border-primary text-primary font-[600]"
                  : "text-[0.875rem] opacity-60"
              }`}
            >
              {bucket.charAt(0).toUpperCase() + bucket.slice(1)} ({count})
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[0.875rem] opacity-60">
              No applications in this bucket
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ScreeningApplicationCard
                key={application.id}
                application={application}
                project={projects[application.projectId.toString()]}
                onScore={handleScoreClick}
                onViewDetails={handleViewDetails}
                onShortlist={(app) => handleShortlist(app.id.toString())}
                onReject={(app) => handleReject(app.id.toString())}
                onWaitlist={(app) => handleWaitlist(app.id.toString())}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Score Application Modal */}
      <ScoreApplicationModal
        open={scoringModalOpen}
        application={selectedApplication}
        project={selectedApplication ? projects[selectedApplication.projectId.toString()] : undefined}
        onClose={() => {
          setScoringModalOpen(false);
          setSelectedApplication(null);
        }}
        onSubmit={handleScoreSubmit}
      />

      {/* Details Modal */}
      <ScreeningApplicationDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApplicationForDetails(null);
        }}
        application={selectedApplicationForDetails}
        project={selectedApplicationForDetails ? projects[selectedApplicationForDetails.projectId.toString()] : undefined}
        students={selectedApplicationForDetails ? getStudentsForApplication(selectedApplicationForDetails) : []}
        group={selectedApplicationForDetails ? getGroupForApplication(selectedApplicationForDetails) : undefined}
        onScore={handleScoreClick}
      />
    </div>
  );
}

