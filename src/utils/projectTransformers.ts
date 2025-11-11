// /**
//  * Project data transformation utilities
//  * Transforms API data to display format
//  */
// import { ApplicationI } from "@/src/models/application";
// import { MilestoneI } from "@/src/models/milestone";
// import { ProjectI } from "@/src/models/project";

// /**
//  * Maps application status from API format to display format
//  */
// export const mapApplicationStatus = (status: string): string => {
//   const statusMap: Record<string, string> = {
//     SUBMITTED: "submitted",
//     SHORTLISTED: "shortlist",
//     WAITLIST: "consider",
//     REJECTED: "rejected",
//     OFFERED: "shortlist",
//     ACCEPTED: "shortlist",
//     DECLINED: "rejected",
//     ASSIGNED: "completed",
//   };
//   return statusMap[status] || "submitted";
// };

// /**
//  * Maps milestone status from API format to display format
//  */
// export const mapMilestoneStatus = (status: string): string => {
//   const statusMap: Record<string, string> = {
//     DRAFT: "scheduled",
//     PROPOSED: "scheduled",
//     ACCEPTED: "scheduled",
//     FINALIZED: "finalized",
//     FUNDED: "finalized",
//     IN_PROGRESS: "in-progress",
//     SUBMITTED: "in-progress",
//     SUPERVISOR_REVIEW: "in-progress",
//     PARTNER_REVIEW: "partner-review",
//     APPROVED: "completed",
//     CHANGES_REQUESTED: "in-progress",
//     RELEASED: "released", // Changed from "completed" to "released" to differentiate from COMPLETED
//     COMPLETED: "completed",
//   };
//   return statusMap[status] || "scheduled";
// };

// /**
//  * Transforms applications to display format
//  * Loads group and user data from mock files for display
//  * Note: This function uses dynamic imports which should be awaited at call site
//  */
// export const transformApplications = (
//   applications: ApplicationI[],
//   groups?: {
//     id: number;
//     name: string;
//     memberIds: number | string[];
//     leaderId: number | string;
//   }[],
//   users?: { id: number; name: string; profile: { avatar: string } }[]
// ) => {
//   return applications.map((app) => {
//     const portfolioScore = app.score?.portfolioScore || 0;
//     const finalScore = app.score?.finalScore || portfolioScore;

//     // Get group name if GROUP type
//     let groupName = "Individual Applicant";
//     if (app.applicantType === "GROUP" && app.groupId && groups) {
//       const group = groups.find((g) => g.id === app.groupId);
//       groupName = group?.name || `Group ${app.groupId}`;
//     } else if (
//       app.applicantType === "INDIVIDUAL" &&
//       app.studentIds.length > 0 &&
//       users
//     ) {
//       const student = users.find((u) => u.id === app.studentIds[0]);
//       groupName = student?.name || "Individual Applicant";
//     }

//     // Get member data
//     // For GROUP applications, get all members from the group (including leader)
//     // For INDIVIDUAL applications, use studentIds from the application
//     let memberIds: string[] = [];
//     if (app.applicantType === "GROUP" && app.groupId && groups) {
//       const group = groups.find((g) => g.id === app.groupId);
//       if (group) {
//         // Add all memberIds from the group
//         memberIds = [...(group.memberIds || [])];
//         // Also add leader if not already in memberIds
//         if (group.leaderId && !memberIds.includes(group.leaderId)) {
//           memberIds.push(group.leaderId);
//         }
//       }
//     } else {
//       // For INDIVIDUAL applications, use studentIds from the application
//       memberIds = app.studentIds;
//     }

//     const members = memberIds.map((studentId) => {
//       const user = users?.find((u) => u.id === studentId);
//       return {
//         name: user?.name || "Team Member",
//         avatar:
//           user?.profile?.avatar ||
//           "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
//       };
//     });

//     return {
//       id: app.id,
//       groupName,
//       members,
//       status: mapApplicationStatus(app.status),
//       portfolioScore: finalScore,
//       appliedAt: app.createdAt,
//       applicantType: app.applicantType,
//       rawStatus: app.status,
//     };
//   });
// };

// /**
//  * Transforms milestones to display format
//  */
// export const transformMilestones = (
//   milestones: MilestoneI[],
//   projectCurrency?: string
// ) => {
//   return milestones.map((milestone) => ({
//     id: milestone.id,
//     title: milestone.title,
//     status: mapMilestoneStatus(milestone.status),
//     dueDate: milestone.dueDate,
//     amount: milestone.amount,
//     currency: milestone.currency || projectCurrency, // Use milestone currency or fallback to project currency
//     progress:
//       milestone.status === "IN_PROGRESS"
//         ? 45
//         : milestone.status === "COMPLETED"
//         ? 100
//         : undefined,
//     completedDate:
//       milestone.status === "COMPLETED" ? milestone.updatedAt : undefined,
//   }));
// };

// /**
//  * Transforms team members from assigned applications
//  * Shows ALL members (not limited to 3)
//  * Includes supervisor if assigned
//  * Adds badges for leader, supervisor, and current user
//  */
// export const transformTeamMembers = (
//   applications: ApplicationI[],
//   users?: unknown[],
//   groups?: unknown[],
//   supervisorId?: string,
//   currentUserId?: string
// ) => {
//   const assignedApps = applications.filter((app) => app.status === "ASSIGNED");
//   const roles = [
//     "Lead Developer",
//     "UI/UX Designer",
//     "Backend Developer",
//     "Frontend Developer",
//     "Full Stack Developer",
//     "QA Engineer",
//   ];

//   // Create a map of studentId -> group for quick lookup
//   const studentToGroupMap = new Map<string, unknown>();
//   groups?.forEach((group) => {
//     group.memberIds?.forEach((memberId: string) => {
//       studentToGroupMap.set(memberId, group);
//     });
//     // Also include leader in the map
//     if (group.leaderId) {
//       studentToGroupMap.set(group.leaderId, group);
//     }
//   });

//   // Get all student team members from assigned applications
//   // For GROUP applications, get all members from the group
//   // For INDIVIDUAL applications, use the studentIds from the application
//   const allStudentIds = new Set<string>();

//   assignedApps.forEach((app) => {
//     if (app.applicantType === "GROUP" && app.groupId && groups) {
//       // Get all members from the group
//       const group = groups.find((g) => g.id === app.groupId);
//       if (group) {
//         // Add all memberIds from the group
//         (group as { memberIds: string[] }).memberIds?.forEach(
//           (memberId: string) => {
//             allStudentIds.add(memberId);
//           }
//         );
//         // Also add leader if not already in memberIds
//         if ((group as { leaderId: string }).leaderId) {
//           allStudentIds.add((group as { leaderId: string }).leaderId);
//         }
//       }
//     } else {
//       // For INDIVIDUAL applications, use the studentIds from the application
//       app.studentIds.forEach((studentId) => {
//         allStudentIds.add(studentId);
//       });
//     }
//   });

//   const studentMembers = Array.from(allStudentIds).map((studentId, idx) => {
//     const user = users?.find((u) => u.id === studentId);
//     const group = studentToGroupMap.get(studentId);
//     const isLeader = Boolean(group?.leaderId === studentId);
//     const isSupervisor = Boolean(supervisorId === studentId);
//     const isYou = Boolean(currentUserId === studentId);

//     return {
//       id: studentId || `member-${idx}`, // Ensure id is always present
//       name: user?.name || "Team Member",
//       role: roles[idx] || "Developer",
//       avatar:
//         user?.profile?.avatar ||
//         "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
//       badges: {
//         isLeader,
//         isSupervisor,
//         isYou,
//       },
//     };
//   });

//   // Check if supervisor exists and is not already in the list
//   const studentIds = studentMembers.map((m) => m.id);
//   const teamMembers: typeof studentMembers = [...studentMembers];

//   if (supervisorId && !studentIds.includes(supervisorId)) {
//     const supervisorUser = users?.find((u) => u.id === supervisorId);
//     if (supervisorUser) {
//       // Add supervisor at the end of the list (below the team)
//       teamMembers.push({
//         id: supervisorId,
//         name: supervisorUser.name || "Supervisor",
//         role: "Project Supervisor",
//         avatar:
//           supervisorUser.profile?.avatar ||
//           "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
//         badges: {
//           isLeader: false,
//           isSupervisor: true,
//           isYou: Boolean(currentUserId === supervisorId),
//         },
//       });
//     }
//   }

//   return teamMembers;
// };

/**
 * Project data transformation utilities
 * Transforms API data to display format
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

interface UserProfile {
  avatar?: string;
}

interface User {
  id: string | number;
  name: string;
  profile?: UserProfile;
}

interface Group {
  id: string | number;
  name: string;
  memberIds: (string | number)[];
  leaderId: string | number;
}

interface Score {
  portfolioScore: number;
  finalScore?: number;
}

interface Application {
  id: string | number;
  status: string;
  applicantType: "GROUP" | "INDIVIDUAL";
  groupId?: string | number;
  studentIds: (string | number)[];
  score?: Score;
  createdAt: string;
}

interface Milestone {
  id: string | number;
  title: string;
  status: string;
  dueDate: string;
  amount: number;
  currency?: string;
  updatedAt: string;
}

interface DisplayApplication {
  id: string | number;
  groupName: string;
  members: Array<{
    name: string;
    avatar: string;
  }>;
  status: string;
  portfolioScore: number;
  appliedAt: string;
  applicantType: "GROUP" | "INDIVIDUAL";
  rawStatus: string;
}

interface DisplayMilestone {
  id: string | number;
  title: string;
  status: string;
  dueDate: string;
  amount: number;
  currency?: string;
  progress?: number;
  completedDate?: string;
}

interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  badges: {
    isLeader: boolean;
    isSupervisor: boolean;
    isYou: boolean;
  };
}

// ============================================================================
// Status Mapping
// ============================================================================

const APPLICATION_STATUS_MAP: Record<string, string> = {
  SUBMITTED: "submitted",
  SHORTLISTED: "shortlist",
  WAITLIST: "consider",
  REJECTED: "rejected",
  OFFERED: "shortlist",
  ACCEPTED: "shortlist",
  DECLINED: "rejected",
  ASSIGNED: "completed",
};

const MILESTONE_STATUS_MAP: Record<string, string> = {
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
  RELEASED: "released",
  COMPLETED: "completed",
};

// ============================================================================
// Transformers
// ============================================================================

/**
 * Maps application status from API format to display format
 */
export const mapApplicationStatus = (status: string): string => {
  return APPLICATION_STATUS_MAP[status] || "submitted";
};

/**
 * Maps milestone status from API format to display format
 */
export const mapMilestoneStatus = (status: string): string => {
  return MILESTONE_STATUS_MAP[status] || "scheduled";
};

/**
 * Transforms applications to display format
 * Loads group and user data from mock files for display
 */
export const transformApplications = (
  applications: Application[],
  groups?: Group[],
  users?: User[]
): DisplayApplication[] => {
  return applications.map((app) => {
    const portfolioScore =
      app.score?.finalScore ?? app.score?.portfolioScore ?? 0;

    // Get group name
    let groupName = "Individual Applicant";
    if (app.applicantType === "GROUP" && app.groupId && groups) {
      const group = groups.find((g) => g.id === app.groupId);
      groupName = group?.name ?? `Group ${app.groupId}`;
    } else if (
      app.applicantType === "INDIVIDUAL" &&
      app.studentIds.length > 0 &&
      users
    ) {
      const student = users.find((u) => u.id === app.studentIds[0]);
      groupName = student?.name ?? "Individual Applicant";
    }

    // Get member IDs
    const memberIds = getMemberIds(app, groups);

    // Map members to display format
    const members = memberIds.map((studentId) => {
      const user = users?.find((u) => u.id === studentId);
      return {
        name: user?.name ?? "Team Member",
        avatar:
          user?.profile?.avatar ??
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      };
    });

    return {
      id: app.id,
      groupName,
      members,
      status: mapApplicationStatus(app.status),
      portfolioScore,
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
  milestones: Milestone[],
  projectCurrency?: string
): DisplayMilestone[] => {
  return milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    status: mapMilestoneStatus(milestone.status),
    dueDate: milestone.dueDate,
    amount: milestone.amount,
    currency: milestone.currency ?? projectCurrency,
    progress: getProgressForMilestone(milestone.status),
    completedDate:
      milestone.status === "COMPLETED" ? milestone.updatedAt : undefined,
  }));
};

/**
 * Transforms team members from assigned applications
 * Shows all members including supervisor if assigned
 * Adds badges for leader, supervisor, and current user
 */
export const transformTeamMembers = (
  applications: Application[],
  users?: User[],
  groups?: Group[],
  supervisorId?: string | number,
  currentUserId?: string | number
): TeamMember[] => {
  const assignedApps = applications.filter((app) => app.status === "ASSIGNED");
  const roles = [
    "Lead Developer",
    "UI/UX Designer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "QA Engineer",
  ];

  // Create map for quick group lookup by student ID
  const studentToGroupMap = new Map<string | number, Group>();
  groups?.forEach((group) => {
    group.memberIds?.forEach((memberId) => {
      studentToGroupMap.set(memberId, group);
    });
    if (group.leaderId) {
      studentToGroupMap.set(group.leaderId, group);
    }
  });

  // Collect all unique student IDs from assigned applications
  const allStudentIds = new Set<string | number>();

  assignedApps.forEach((app) => {
    if (app.applicantType === "GROUP" && app.groupId && groups) {
      const group = groups.find((g) => g.id === app.groupId);
      if (group) {
        group.memberIds?.forEach((memberId) => {
          allStudentIds.add(memberId);
        });
        if (group.leaderId) {
          allStudentIds.add(group.leaderId);
        }
      }
    } else {
      app.studentIds.forEach((studentId) => {
        allStudentIds.add(studentId);
      });
    }
  });

  // Transform student members
  const studentMembers: TeamMember[] = Array.from(allStudentIds).map(
    (studentId, idx) => {
      const user = users?.find((u) => u.id === studentId);
      const group = studentToGroupMap.get(studentId);
      const isLeader = Boolean(group?.leaderId === studentId);
      const isSupervisor = Boolean(supervisorId === studentId);
      const isYou = Boolean(currentUserId === studentId);

      return {
        id: studentId,
        name: user?.name ?? "Team Member",
        role: roles[idx] ?? "Developer",
        avatar:
          user?.profile?.avatar ??
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        badges: {
          isLeader,
          isSupervisor,
          isYou,
        },
      };
    }
  );

  // Add supervisor if not already in the list
  const teamMembers = [...studentMembers];
  const studentIds = studentMembers.map((m) => m.id);

  if (supervisorId && !studentIds.includes(supervisorId)) {
    const supervisorUser = users?.find((u) => u.id === supervisorId);
    if (supervisorUser) {
      teamMembers.push({
        id: supervisorId,
        name: supervisorUser.name ?? "Supervisor",
        role: "Project Supervisor",
        avatar:
          supervisorUser.profile?.avatar ??
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

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extracts member IDs from an application
 * For GROUP applications, returns all group members
 * For INDIVIDUAL applications, returns student IDs
 */
function getMemberIds(app: Application, groups?: Group[]): (string | number)[] {
  if (app.applicantType === "GROUP" && app.groupId && groups) {
    const group = groups.find((g) => g.id === app.groupId);
    if (group) {
      const memberIds = [...(group.memberIds ?? [])];
      if (group.leaderId && !memberIds.includes(group.leaderId)) {
        memberIds.push(group.leaderId);
      }
      return memberIds;
    }
  }
  return app.studentIds;
}

/**
 * Determines progress percentage for milestone based on status
 */
function getProgressForMilestone(status: string): number | undefined {
  if (status === "IN_PROGRESS") {
    return 45;
  }
  if (status === "COMPLETED") {
    return 100;
  }
  return undefined;
}
