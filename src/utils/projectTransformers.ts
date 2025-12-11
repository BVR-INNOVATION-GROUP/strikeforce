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
      // Normalize ID comparison
      const normalizedGroupId =
        typeof app.groupId === "string" ? Number(app.groupId) : app.groupId;
      const group = groups.find((g) => {
        const groupId = typeof g.id === "string" ? Number(g.id) : g.id;
        return groupId === normalizedGroupId;
      });
      groupName = group?.name ?? `Group ${app.groupId}`;
    } else if (
      app.applicantType === "INDIVIDUAL" &&
      app.studentIds.length > 0 &&
      users
    ) {
      // Normalize ID comparison
      const normalizedStudentId =
        typeof app.studentIds[0] === "string"
          ? Number(app.studentIds[0])
          : app.studentIds[0];
      const student = users.find((u) => {
        const userId = typeof u.id === "string" ? Number(u.id) : u.id;
        return userId === normalizedStudentId;
      });
      groupName = student?.name ?? "Individual Applicant";
    }

    // Get member IDs
    const memberIds = getMemberIds(app, groups);

    // Map members to display format
    const members = memberIds.map((studentId) => {
      // Normalize ID comparison to handle both string and number types
      const normalizedStudentId =
        typeof studentId === "string" ? Number(studentId) : studentId;
      const user = users?.find((u) => {
        const userId = typeof u.id === "string" ? Number(u.id) : u.id;
        return userId === normalizedStudentId;
      });
      return {
        name: user?.name ?? "Team Member",
        avatar: user?.profile?.avatar ?? "", // Empty string triggers initials fallback in UI
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

  // Extract users from groups if they have member data (backend preloads Members)
  const usersFromGroups: User[] = [];
  const groupUsersMap = new Map<string | number, User>();

  groups?.forEach((group) => {
    // Check if group has members array (from backend preload)
    const groupWithMembers = group as any;
    if (groupWithMembers.members && Array.isArray(groupWithMembers.members)) {
      groupWithMembers.members.forEach((member: any) => {
        if (member && member.id) {
          const memberId =
            typeof member.id === "string" ? Number(member.id) : member.id;
          if (!groupUsersMap.has(memberId)) {
            groupUsersMap.set(memberId, member);
            usersFromGroups.push(member);
          }
        }
      });
    }
    // Also check for leader if available
    if (groupWithMembers.user && groupWithMembers.user.id) {
      const leaderId =
        typeof groupWithMembers.user.id === "string"
          ? Number(groupWithMembers.user.id)
          : groupWithMembers.user.id;
      if (!groupUsersMap.has(leaderId)) {
        groupUsersMap.set(leaderId, groupWithMembers.user);
        usersFromGroups.push(groupWithMembers.user);
      }
    }
  });

  // Merge users from groups with provided users array
  const allUsers = [...(users || [])];
  usersFromGroups.forEach((groupUser) => {
    const userId =
      typeof groupUser.id === "string" ? Number(groupUser.id) : groupUser.id;
    const exists = allUsers.some((u) => {
      const uId = typeof u.id === "string" ? Number(u.id) : u.id;
      return uId === userId;
    });
    if (!exists) {
      allUsers.push(groupUser);
    }
  });

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
      // Normalize ID comparison
      const normalizedGroupId =
        typeof app.groupId === "string" ? Number(app.groupId) : app.groupId;
      const group = groups.find((g) => {
        const groupId = typeof g.id === "string" ? Number(g.id) : g.id;
        return groupId === normalizedGroupId;
      });
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
      // Normalize ID comparison
      const normalizedStudentId =
        typeof studentId === "string" ? Number(studentId) : studentId;

      // Try to find user in merged users array (includes users from groups)
      const user =
        allUsers.find((u) => {
          const userId = typeof u.id === "string" ? Number(u.id) : u.id;
          return userId === normalizedStudentId;
        }) || groupUsersMap.get(studentId);
      const group = studentToGroupMap.get(studentId);
      // Normalize leaderId for comparison
      const normalizedLeaderId = group?.leaderId
        ? typeof group.leaderId === "string"
          ? Number(group.leaderId)
          : group.leaderId
        : undefined;
      const isLeader = Boolean(normalizedLeaderId === normalizedStudentId);
      // Normalize supervisorId and currentUserId for comparison
      const normalizedSupervisorId = supervisorId
        ? typeof supervisorId === "string"
          ? Number(supervisorId)
          : supervisorId
        : undefined;
      const normalizedCurrentUserId = currentUserId
        ? typeof currentUserId === "string"
          ? Number(currentUserId)
          : currentUserId
        : undefined;
      const isSupervisor = Boolean(
        normalizedSupervisorId === normalizedStudentId
      );
      const isYou = Boolean(normalizedCurrentUserId === normalizedStudentId);

      // Determine role based on actual data
      let role = "Team Member";
      if (isLeader) {
        role = "Group Leader";
      }

      return {
        id: studentId,
        name: user?.name ?? "Team Member",
        role: role,
        avatar: user?.profile?.avatar ?? "", // Empty string for fallback to initials
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

  if (supervisorId) {
    // Normalize supervisorId for comparison
    const normalizedSupervisorId =
      typeof supervisorId === "string" ? Number(supervisorId) : supervisorId;
    const supervisorInList = studentIds.some((id) => {
      const normalizedId = typeof id === "string" ? Number(id) : id;
      return normalizedId === normalizedSupervisorId;
    });
    if (!supervisorInList) {
      const supervisorUser = allUsers.find((u) => {
        const userId = typeof u.id === "string" ? Number(u.id) : u.id;
        return userId === normalizedSupervisorId;
      });
      if (supervisorUser) {
        const normalizedCurrentUserId = currentUserId
          ? typeof currentUserId === "string"
            ? Number(currentUserId)
            : currentUserId
          : undefined;
        teamMembers.push({
          id: supervisorId,
          name: supervisorUser.name ?? "Supervisor",
          role: "Project Supervisor",
          avatar: supervisorUser.profile?.avatar ?? "", // Empty string for fallback to initials
          badges: {
            isLeader: false,
            isSupervisor: true,
            isYou: Boolean(normalizedCurrentUserId === normalizedSupervisorId),
          },
        });
      }
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
    // Normalize ID comparison
    const normalizedGroupId =
      typeof app.groupId === "string" ? Number(app.groupId) : app.groupId;
    const group = groups.find((g) => {
      const groupId = typeof g.id === "string" ? Number(g.id) : g.id;
      return groupId === normalizedGroupId;
    });
    if (group) {
      const memberIds = [...(group.memberIds ?? [])];
      // Normalize leaderId for comparison
      const normalizedLeaderId =
        typeof group.leaderId === "string"
          ? Number(group.leaderId)
          : group.leaderId;
      if (
        normalizedLeaderId &&
        !memberIds.some((id) => {
          const normalizedId = typeof id === "string" ? Number(id) : id;
          return normalizedId === normalizedLeaderId;
        })
      ) {
        memberIds.push(normalizedLeaderId);
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
