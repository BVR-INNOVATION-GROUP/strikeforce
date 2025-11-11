/**
 * Service layer for supervisor business logic
 * Handles supervisor requests, capacity management, and approval workflows
 * PRD Reference: Section 5 - Supervisor Selection
 */
import { SupervisorRequestI, SupervisorCapacityI } from "@/src/models/supervisor";
import { supervisorRepository } from "@/src/repositories/supervisorRepository";
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
    requestId: string | number,
    supervisorId: string
  ): Promise<SupervisorRequestI> => {
    // Get existing request
    const numericRequestId = typeof requestId === 'string' ? parseInt(requestId, 10) : requestId;
    const existingRequest = await supervisorRepository.getRequestById(numericRequestId);

    // Check capacity before approval
    if (!hasCapacity(supervisorId)) {
      throw new Error(
        "Supervisor capacity exceeded. Cannot approve more requests at this time."
      );
    }

    // Update request status via repository
    const updatedRequest = await supervisorRepository.updateRequest(numericRequestId, {
      status: "APPROVED",
    });

    // In production, this would also:
    // 1. Assign supervisor to project
    // 2. Update supervisor capacity
    // 3. Send notifications

    return updatedRequest;
  },

  /**
   * Deny supervisor request
   * @param requestId - Supervisor request ID
   * @param supervisorId - Supervisor user ID
   * @returns Updated request with DENIED status
   */
  denyRequest: async (
    requestId: string | number,
    supervisorId: string
  ): Promise<SupervisorRequestI> => {
    // Get existing request
    const numericRequestId = typeof requestId === 'string' ? parseInt(requestId, 10) : requestId;
    
    // Update request status via repository
    const updatedRequest = await supervisorRepository.updateRequest(numericRequestId, {
      status: "DENIED",
    });

    // In production, this would also send notifications

    return updatedRequest;
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

    // Check for duplicate pending requests
    const existingRequests = await supervisorRepository.getRequests(
      undefined,
      requestData.projectId,
      requestData.studentOrGroupId
    );
    const duplicate = existingRequests.find(
      (r) =>
        r.supervisorId === requestData.supervisorId &&
        r.status === "PENDING"
    );

    if (duplicate) {
      throw new Error("A pending request already exists for this project and supervisor");
    }

    // Create request via repository (handles API call)
    return supervisorRepository.createRequest({
      projectId: requestData.projectId,
      supervisorId: requestData.supervisorId,
      studentOrGroupId: requestData.studentOrGroupId,
      message: requestData.message || "",
      status: "PENDING",
    });
  },
};

