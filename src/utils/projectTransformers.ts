/**
 * Project data transformation utilities
 * Transforms API data to display format
 */
import { ApplicationI } from "@/src/models/application";
import { MilestoneI } from "@/src/models/milestone";
import { ProjectI } from "@/src/models/project";

/**
 * Maps application status from API format to display format
 */
export const mapApplicationStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    SUBMITTED: "submitted",
    SHORTLISTED: "shortlist",
    WAITLIST: "consider",
    REJECTED: "rejected",
    OFFERED: "shortlist",
    ACCEPTED: "shortlist",
    DECLINED: "rejected",
    ASSIGNED: "completed",
  };
  return statusMap[status] || "submitted";
};

/**
 * Maps milestone status from API format to display format
 */
export const mapMilestoneStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    DRAFT: "scheduled",
    PROPOSED: "scheduled",
    ACCEPTED: "scheduled",
    FINALIZED: "finalized",
    FUNDED: "finalized",
    IN_PROGRESS: "in-progress",
    SUBMITTED: "in-progress",
    SUPERVISOR_REVIEW: "in-progress",
    PARTNER_REVIEW: "partner-review",
    APPROVED: "completed",
    CHANGES_REQUESTED: "in-progress",
    RELEASED: "released", // Changed from "completed" to "released" to differentiate from COMPLETED
    COMPLETED: "completed",
  };
  return statusMap[status] || "scheduled";
};

/**
 * Transforms applications to display format
 * Loads group and user data from mock files for display
 * Note: This function uses dynamic imports which should be awaited at call site
 */
export const transformApplications = (
  applications: ApplicationI[],
  groups?: any[],
  users?: any[]
) => {
  return applications.map((app) => {
    const portfolioScore = app.score?.portfolioScore || 0;
    const finalScore = app.score?.finalScore || portfolioScore;

    // Get group name if GROUP type
    let groupName = "Individual Applicant";
    if (app.applicantType === "GROUP" && app.groupId && groups) {
      const group = groups.find((g) => g.id === app.groupId);
      groupName = group?.name || `Group ${app.groupId}`;
    } else if (
      app.applicantType === "INDIVIDUAL" &&
      app.studentIds.length > 0 &&
      users
    ) {
      const student = users.find((u) => u.id === app.studentIds[0]);
      groupName = student?.name || "Individual Applicant";
    }

    // Get member data
    // For GROUP applications, get all members from the group (including leader)
    // For INDIVIDUAL applications, use studentIds from the application
    let memberIds: string[] = [];
    if (app.applicantType === "GROUP" && app.groupId && groups) {
      const group = groups.find((g) => g.id === app.groupId);
      if (group) {
        // Add all memberIds from the group
        memberIds = [...(group.memberIds || [])];
        // Also add leader if not already in memberIds
        if (group.leaderId && !memberIds.includes(group.leaderId)) {
          memberIds.push(group.leaderId);
        }
      }
    } else {
      // For INDIVIDUAL applications, use studentIds from the application
      memberIds = app.studentIds;
    }

    const members = memberIds.map((studentId) => {
      const user = users?.find((u) => u.id === studentId);
      return {
        name: user?.name || "Team Member",
        avatar:
          user?.profile?.avatar ||
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      };
    });

    return {
      id: app.id,
      groupName,
      members,
      status: mapApplicationStatus(app.status),
      portfolioScore: finalScore,
      appliedAt: app.createdAt,
      applicantType: app.applicantType,
      rawStatus: app.status,
    };
  });
};

/**
 * Transforms milestones to display format
 */
export const transformMilestones = (
  milestones: MilestoneI[],
  projectCurrency?: string
) => {
  return milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    status: mapMilestoneStatus(milestone.status),
    dueDate: milestone.dueDate,
    amount: milestone.amount,
    currency: milestone.currency || projectCurrency, // Use milestone currency or fallback to project currency
    progress:
      milestone.status === "IN_PROGRESS"
        ? 45
        : milestone.status === "COMPLETED"
        ? 100
        : undefined,
    completedDate:
      milestone.status === "COMPLETED" ? milestone.updatedAt : undefined,
  }));
};

/**
 * Transforms team members from assigned applications
 * Shows ALL members (not limited to 3)
 * Includes supervisor if assigned
 * Adds badges for leader, supervisor, and current user
 */
export const transformTeamMembers = (
  applications: ApplicationI[],
  users?: any[],
  groups?: any[],
  supervisorId?: string,
  currentUserId?: string
) => {
  const assignedApps = applications.filter((app) => app.status === "ASSIGNED");
  const roles = [
    "Lead Developer",
    "UI/UX Designer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "QA Engineer",
  ];

  // Create a map of studentId -> group for quick lookup
  const studentToGroupMap = new Map<string, any>();
  groups?.forEach((group) => {
    group.memberIds?.forEach((memberId: string) => {
      studentToGroupMap.set(memberId, group);
    });
    // Also include leader in the map
    if (group.leaderId) {
      studentToGroupMap.set(group.leaderId, group);
    }
  });

  // Get all student team members from assigned applications
  // For GROUP applications, get all members from the group
  // For INDIVIDUAL applications, use the studentIds from the application
  const allStudentIds = new Set<string>();

  assignedApps.forEach((app) => {
    if (app.applicantType === "GROUP" && app.groupId && groups) {
      // Get all members from the group
      const group = groups.find((g) => g.id === app.groupId);
      if (group) {
        // Add all memberIds from the group
        group.memberIds?.forEach((memberId: string) => {
          allStudentIds.add(memberId);
        });
        // Also add leader if not already in memberIds
        if (group.leaderId) {
          allStudentIds.add(group.leaderId);
        }
      }
    } else {
      // For INDIVIDUAL applications, use the studentIds from the application
      app.studentIds.forEach((studentId) => {
        allStudentIds.add(studentId);
      });
    }
  });

  const studentMembers = Array.from(allStudentIds).map((studentId, idx) => {
    const user = users?.find((u) => u.id === studentId);
    const group = studentToGroupMap.get(studentId);
    const isLeader = Boolean(group?.leaderId === studentId);
    const isSupervisor = Boolean(supervisorId === studentId);
    const isYou = Boolean(currentUserId === studentId);

    return {
      id: studentId || `member-${idx}`, // Ensure id is always present
      name: user?.name || "Team Member",
      role: roles[idx] || "Developer",
      avatar:
        user?.profile?.avatar ||
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      badges: {
        isLeader,
        isSupervisor,
        isYou,
      },
    };
  });

  // Check if supervisor exists and is not already in the list
  const studentIds = studentMembers.map((m) => m.id);
  const teamMembers: typeof studentMembers = [...studentMembers];

  if (supervisorId && !studentIds.includes(supervisorId)) {
    const supervisorUser = users?.find((u) => u.id === supervisorId);
    if (supervisorUser) {
      // Add supervisor at the end of the list (below the team)
      teamMembers.push({
        id: supervisorId,
        name: supervisorUser.name || "Supervisor",
        role: "Project Supervisor",
        avatar:
          supervisorUser.profile?.avatar ||
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        badges: {
          isLeader: false,
          isSupervisor: true,
          isYou: Boolean(currentUserId === supervisorId),
        },
      });
    }
  }

  return teamMembers;
};
