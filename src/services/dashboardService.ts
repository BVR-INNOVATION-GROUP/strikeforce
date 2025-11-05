/**
 * Dashboard service - provides dashboard statistics and metrics
 * Separates data logic from UI components
 */
import { projectRepository } from "@/src/repositories/projectRepository";
import { ProjectI } from "@/src/models/project";

/**
 * University admin dashboard statistics interface
 */
export interface UniversityAdminDashboardStats {
  totalStudents: number;
  activeProjects: number;
  pendingReviews: number;
  totalStudentsChange?: number;
  activeProjectsChange?: number;
}

/**
 * Super admin dashboard statistics interface
 */
export interface SuperAdminDashboardStats {
  pendingKYC: number;
  activeDisputes: number;
  totalOrganizations: number;
  pendingKYCChange?: number;
  activeDisputesChange?: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  completedProjects: number;
  totalBudgetChange?: number; // Percentage change from previous period
  activeProjectsChange?: number;
}

export interface PartnerDashboardStats extends DashboardStats {
}

export const dashboardService = {
  /**
   * Get partner dashboard statistics
   * @param partnerId - User ID of the partner
   * @param orgId - Optional organization ID (not used for wallet anymore)
   */
  getPartnerDashboardStats: async (
    partnerId: string,
    orgId?: string
  ): Promise<PartnerDashboardStats> => {
    const projects = await projectRepository.getAll();
    const partnerProjects = projects.filter((p) => p.partnerId === partnerId);

    const stats: PartnerDashboardStats = {
      totalProjects: partnerProjects.length,
      activeProjects: partnerProjects.filter((p) => p.status === "in-progress")
        .length,
      totalBudget: partnerProjects.reduce((sum, p) => sum + p.budget, 0),
      completedProjects: partnerProjects.filter((p) => p.status === "completed")
        .length,
      // Mock change percentages - in production, calculate from historical data
      totalBudgetChange: 12.5,
      activeProjectsChange: -5.2,
    };

    return stats;
  },

  /**
   * Get student dashboard statistics
   */
  getStudentDashboardStats: async (
    studentId: string
  ): Promise<DashboardStats> => {
    // In production, fetch from API
    const projects = await projectRepository.getAll();

    return {
      totalProjects: 0, // Projects assigned to this student
      activeProjects: 0,
      totalBudget: 0,
      completedProjects: 0,
      activeProjectsChange: 8.3,
      totalBudgetChange: 15.7,
    };
  },

  /**
   * Get supervisor dashboard statistics
   */
  getSupervisorDashboardStats: async (
    supervisorId: string
  ): Promise<DashboardStats> => {
    const projects = await projectRepository.getAll();
    const supervisedProjects = projects.filter(
      (p) => p.supervisorId === supervisorId
    );

    return {
      totalProjects: supervisedProjects.length,
      activeProjects: supervisedProjects.filter(
        (p) => p.status === "in-progress"
      ).length,
      totalBudget: supervisedProjects.reduce((sum, p) => sum + p.budget, 0),
      completedProjects: supervisedProjects.filter(
        (p) => p.status === "completed"
      ).length,
      activeProjectsChange: 10.5,
      totalBudgetChange: 22.3,
    };
  },

  /**
   * Get university admin dashboard statistics
   * @param universityId - University ID for filtering
   * @returns University admin dashboard statistics
   */
  getUniversityAdminDashboardStats: async (
    universityId: string
  ): Promise<UniversityAdminDashboardStats> => {
    // In production, fetch from API
    return {
      totalStudents: 125,
      activeProjects: 8,
      pendingReviews: 3,
      totalStudentsChange: 5.2,
      activeProjectsChange: -2.1,
    };
  },

  /**
   * Get super admin dashboard statistics
   * @returns Super admin dashboard statistics
   */
  getSuperAdminDashboardStats: async (): Promise<SuperAdminDashboardStats> => {
    // In production, fetch from API
    return {
      pendingKYC: 2,
      activeDisputes: 2,
      totalOrganizations: 5,
      pendingKYCChange: 15.3,
      activeDisputesChange: -8.7,
    };
  },
};
