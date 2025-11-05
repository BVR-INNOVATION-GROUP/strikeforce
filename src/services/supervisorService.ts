/**
 * Service layer for supervisor business logic
 * Handles supervisor requests, capacity management, and approval workflows
 * PRD Reference: Section 5 - Supervisor Selection
 */
import { SupervisorRequestI, SupervisorCapacityI, SupervisorRequestStatus } from "@/src/models/supervisor";
import { projectService } from "@/src/services/projectService";
import { ProjectI } from "@/src/models/project";

/**
 * Mock supervisor capacity data
 * In production, this would come from a repository/API
 */
const mockCapacity: SupervisorCapacityI[] = [
  { supervisorId: "1", maxActive: 10, currentActive: 3 },
  { supervisorId: "2", maxActive: 15, currentActive: 5 },
];

/**
 * Get supervisor capacity information
 * @param supervisorId - Supervisor user ID
 * @returns Capacity information or default capacity
 */
const getSupervisorCapacity = (supervisorId: string): SupervisorCapacityI => {
  const capacity = mockCapacity.find((c) => c.supervisorId === supervisorId);
  return capacity || { supervisorId, maxActive: 10, currentActive: 0 };
};

/**
 * Check if supervisor has capacity for new project
 * @param supervisorId - Supervisor user ID
 * @returns True if supervisor has available capacity
 */
const hasCapacity = (supervisorId: string): boolean => {
  const capacity = getSupervisorCapacity(supervisorId);
  return capacity.currentActive < capacity.maxActive;
};

export const supervisorService = {
  /**
   * Approve supervisor request
   * Business rules:
   * - Check supervisor capacity
   * - Update request status to APPROVED
   * - Assign supervisor to project
   * @param requestId - Supervisor request ID
   * @param supervisorId - Supervisor user ID
   * @throws Error if capacity exceeded or request not found
   */
  approveRequest: async (
    requestId: string,
    supervisorId: string
  ): Promise<SupervisorRequestI> => {
    // Check capacity before approval
    if (!hasCapacity(supervisorId)) {
      throw new Error(
        "Supervisor capacity exceeded. Cannot approve more requests at this time."
      );
    }

    // In production, this would:
    // 1. Update request status via repository
    // 2. Assign supervisor to project
    // 3. Update supervisor capacity
    // 4. Send notifications
    
    // For now, return mock updated request
    const mockRequest: SupervisorRequestI = {
      id: requestId,
      projectId: "",
      studentOrGroupId: "",
      supervisorId,
      status: "APPROVED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockRequest;
  },

  /**
   * Deny supervisor request
   * @param requestId - Supervisor request ID
   * @param supervisorId - Supervisor user ID
   * @returns Updated request with DENIED status
   */
  denyRequest: async (
    requestId: string,
    supervisorId: string
  ): Promise<SupervisorRequestI> => {
    // In production, this would update request status and send notifications
    const mockRequest: SupervisorRequestI = {
      id: requestId,
      projectId: "",
      studentOrGroupId: "",
      supervisorId,
      status: "DENIED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return mockRequest;
  },

  /**
   * Get supervisor capacity information
   * @param supervisorId - Supervisor user ID
   * @returns Capacity information
   */
  getCapacity: async (supervisorId: string): Promise<SupervisorCapacityI> => {
    return getSupervisorCapacity(supervisorId);
  },

  /**
   * Check if supervisor can accept new requests
   * @param supervisorId - Supervisor user ID
   * @returns True if supervisor has available capacity
   */
  canAcceptRequest: async (supervisorId: string): Promise<boolean> => {
    return hasCapacity(supervisorId);
  },

  /**
   * Get all projects supervised by a supervisor
   * @param supervisorId - Supervisor user ID
   * @returns Array of supervised projects
   */
  getSupervisedProjects: async (supervisorId: string): Promise<ProjectI[]> => {
    const allProjects = await projectService.getAllProjects();
    return allProjects.filter((p) => p.supervisorId === supervisorId);
  },

  /**
   * Create a new supervisor request
   * Business rules:
   * - Validate project exists and student is assigned
   * - Check supervisor exists and is available
   * - Prevent duplicate requests for same project/supervisor
   * @param requestData - Supervisor request data
   * @returns Created supervisor request
   * @throws Error if validation fails
   */
  createRequest: async (
    requestData: Partial<SupervisorRequestI>
  ): Promise<SupervisorRequestI> => {
    // Business validation
    if (!requestData.projectId) {
      throw new Error("Project ID is required");
    }

    if (!requestData.supervisorId) {
      throw new Error("Supervisor ID is required");
    }

    if (!requestData.studentOrGroupId) {
      throw new Error("Student or Group ID is required");
    }

    // In production, this would:
    // 1. Validate project exists and student/group is assigned
    // 2. Check supervisor exists and has capacity
    // 3. Check for duplicate requests
    // 4. Create request via repository
    // 5. Send notifications

    const newRequest: SupervisorRequestI = {
      id: `req-${Date.now()}`,
      projectId: requestData.projectId,
      studentOrGroupId: requestData.studentOrGroupId,
      supervisorId: requestData.supervisorId,
      status: "PENDING",
      message: requestData.message || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newRequest;
  },
};

