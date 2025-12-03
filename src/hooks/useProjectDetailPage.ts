/**
 * Custom hook for project detail page logic
 */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/hooks/useToast";
import { milestoneService } from "@/src/services/milestoneService";
import { useProjectActions } from "@/src/hooks/useProjectActions";
import { useProjectMutations } from "@/src/hooks/useProjectMutations";
import { useProjectData } from "@/src/hooks/useProjectData";
import { useProjectDetailHandlers } from "@/src/hooks/useProjectDetailHandlers";
import { useProjectDetailModals } from "@/src/hooks/useProjectDetailModals";
import { transformProjectForDisplay } from "@/src/utils/projectDisplay";
import { calculateDaysUntilDeadline } from "@/src/utils/dateFormatters";
import { currenciesArray } from "@/src/constants/currencies";
import { chatService } from "@/src/services/chatService";
import { projectService } from "@/src/services/projectService";
import { notificationService } from "@/src/services/notificationService";
import { userRepository } from "@/src/repositories/userRepository";
import { ChatMessageI } from "@/src/models/chat";
import { UserI } from "@/src/models/user";
import { MilestoneI } from "@/src/models/milestone";
import { NotificationI } from "@/src/models/notification";

export interface UseProjectDetailPageResult {
  project: Awaited<ReturnType<typeof transformProjectForDisplay>> | null;
  loading: boolean;
  currencySymbol: string;
  daysUntilDeadline: number;
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    avatar?: string;
  }>;
  chatMessages: ChatMessageI[];
  chatUsers: Record<string, UserI>;
  chatThreadId: string | null;
  actions: ReturnType<typeof useProjectActions>;
  mutations: ReturnType<typeof useProjectMutations>;
  modals: ReturnType<typeof useProjectDetailModals>;
  handlers: ReturnType<typeof useProjectDetailHandlers>;
  projectData: unknown;
  applications: unknown[];
  milestones: unknown[];
  setProjectData: (data: unknown) => void;
  setApplications: (applications: unknown[]) => void;
  setMilestones: (milestones: unknown[]) => void;
  handleAddMilestone: (
    title: string,
    scope: string,
    dueDate: string,
    amount: string,
    currency?: string
  ) => Promise<void>;
  handleUpdateMilestone: (
    milestoneId: string,
    title: string,
    scope: string,
    dueDate: string,
    amount: string,
    currency?: string
  ) => Promise<void>;
  handleDeleteMilestone: (milestoneId: string) => Promise<void>;
  handleSaveProject: (data: unknown) => Promise<void>;
  handleApproveAndRelease: (milestoneId: string) => Promise<void>;
  handleDisapprove: (milestoneId: string) => Promise<void>;
  handleRequestChanges: (milestoneId: string) => Promise<void>;
  handleMarkAsComplete: (milestoneId: string) => Promise<void>;
  handleUnmarkAsComplete: (milestoneId: string) => Promise<void>;
  handleAcceptApplication: (applicationId: number) => Promise<void>;
  handleRejectApplication: (applicationId: number) => Promise<void>;
  handleRecommendApplication: (
    applicationId: number,
    partnerIds?: string[]
  ) => Promise<void>;
  handleDeleteProject: () => Promise<void>;
  handleReassignProject: (applicationId: number) => Promise<void>;
  handleSendChatMessage: (text: string) => Promise<void>;
  router: ReturnType<typeof useRouter>;
  isSaving: boolean;
  isDeleting: boolean;
}

/**
 * Hook for managing project detail page state and logic
 */
export function useProjectDetailPage(
  projectId: string,
  orgId: string | undefined,
  userId?: string
): UseProjectDetailPageResult {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessageI[]>([]);
  const [chatUsers, setChatUsers] = useState<Record<string, UserI>>({});
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Legacy messages format for ChatSection display
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: string;
      text: string;
      timestamp: string;
      avatar?: string;
    }>
  >([]);

  const modals = useProjectDetailModals();
  const mutations = useProjectMutations(projectId);
  const {
    loading,
    projectData,
    applications,
    milestones,
    setProjectData,
    setApplications,
    setMilestones,
  } = useProjectData(projectId);
  const handlers = useProjectDetailHandlers({
    projectId,
    orgId,
    milestones,
    setMilestones,
  });

  // Pass openChatModal and openApplicationDetailModal to useProjectActions
  const actions = useProjectActions(projectId, {
    openChatModal: modals.openChatModal,
    openApplicationDetailModal: modals.openApplicationDetailModal,
  });

  // Reload chat data when application context changes (for application-specific messaging)
  useEffect(() => {
    // When chat modal opens with an application, we could load application-specific messages
    // For now, since threads are project-level, we just ensure the modal updates
    // The title will change to reflect the application context
  }, [modals.selectedChatApplicationId, modals.isChatModalOpen]);

  const [project, setProject] = useState<Awaited<
    ReturnType<typeof transformProjectForDisplay>
  > | null>(null);

  // Load chat data - wrapped in try-catch to prevent blocking UI
  useEffect(() => {
    const loadChatData = async () => {
      if (!projectId) return;

      // Initialize empty state first to prevent UI blocking
      setChatThreadId(null);
      setChatMessages([]);
      setMessages([]);
      setChatUsers({});

      // Load chat data in background - errors should not block UI
      try {
        // Load users first (non-critical)
        let usersMap: Record<string, UserI> = {};
        try {
          const usersData = await userRepository.getAll();
          const usersArray = Array.isArray(usersData)
            ? usersData
            : usersData?.data || [];
          if (Array.isArray(usersArray)) {
            usersArray.forEach((u) => {
              usersMap[u.id] = u;
            });
            setChatUsers(usersMap);
          }
        } catch (userError) {
          // Non-critical: continue without user names
          console.warn("Failed to load users for chat:", userError);
        }

        // Try to load threads (may fail if backend route is misconfigured)
        let threads: ChatThreadI[] = [];
        try {
          threads = await chatService.getUserThreads();
        } catch (threadError: any) {
          // Handle specific error cases
          if (
            threadError?.message?.includes("invalid group ID") ||
            threadError?.status === 400
          ) {
            console.warn(
              "Chat service unavailable - backend route may be misconfigured:",
              threadError.message
            );
          } else {
            console.warn("Failed to load chat threads:", threadError);
          }
          // Return early - chat is not available
          return;
        }

        // Find thread for this project
        const normalizedProjectId = projectId.startsWith("project-")
          ? projectId
          : `project-${projectId}`;

        const projectThread = threads.find(
          (t) =>
            t.projectId === normalizedProjectId ||
            t.projectId === projectId ||
            t.projectId === `project-${projectId}` ||
            t.projectId === String(projectId)
        );

        if (projectThread) {
          const threadId =
            projectThread.id?.toString() || String(projectThread.id);
          setChatThreadId(threadId);
          try {
            const threadMessages = await chatService.getThreadMessages(
              threadId
            );
            setChatMessages(threadMessages);

            // Update legacy messages format
            const formattedMessages = threadMessages.slice(-2).map((msg) => {
              const sender = usersMap[msg.senderId];
              return {
                id: msg.id,
                sender: sender?.name || "Unknown User",
                text: msg.body,
                timestamp: msg.createdAt,
                avatar: sender?.profile?.avatar,
              };
            });
            setMessages(formattedMessages);
          } catch (messageError: any) {
            // Non-critical: messages failed but thread exists
            console.warn(
              "Failed to load thread messages:",
              messageError?.message || messageError
            );
            setChatMessages([]);
            setMessages([]);
          }
        }
        // If no thread found, empty state is already set above
      } catch (error: any) {
        // Catch-all: log but don't throw - UI should continue working
        console.warn(
          "Chat data loading failed (non-critical):",
          error?.message || error
        );
        // Empty states already set at start, so UI won't break
      }
    };

    // Load chat data asynchronously without blocking
    loadChatData().catch((error) => {
      // Final safety net - should never reach here but prevents unhandled promise rejection
      console.warn("Unhandled error in loadChatData:", error);
    });
  }, [projectId, userId]);

  // Use a ref to track if we're manually updating the project
  const isManuallyUpdatingProject = useRef(false);

  useEffect(() => {
    // Skip if we're manually updating (handled in handleAddMilestone)
    if (isManuallyUpdatingProject.current) {
      isManuallyUpdatingProject.current = false;
      return;
    }

    const loadProject = async () => {
      if (!projectData) return; // Don't transform if projectData is not loaded yet

      const transformed = await transformProjectForDisplay(
        projectData,
        applications,
        milestones,
        projectId,
        undefined, // groups - will be loaded inside transformProjectForDisplay
        undefined, // users - will be loaded inside transformProjectForDisplay
        projectData?.supervisorId, // supervisorId from project
        userId // currentUserId
      );
      setProject(transformed);
    };
    loadProject();
  }, [projectData, applications, milestones, projectId, userId]); // Will trigger when milestones array changes

  const currencyInfo = project
    ? currenciesArray.find((c) => c.code === project.currency)
    : undefined;
  const currencySymbol = currencyInfo?.symbol || project?.currency || "";
  const daysUntilDeadline = project
    ? calculateDaysUntilDeadline(project.deadline || "")
    : 0;

  const handleUpdateMilestone = async (
    milestoneId: string,
    title: string,
    scope: string,
    dueDate: string,
    amount: string,
    currency?: string
  ) => {
    // Parse amount (remove commas if present)
    const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;

    try {
      // Update milestone via repository
      const currencyCode = currency || projectData?.currency || "UGX";
      await mutations.handleUpdateMilestone(
        milestoneId,
        title,
        scope,
        dueDate,
        parsedAmount.toString(),
        currencyCode
      );

      // Reload milestones to get updated data
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      // Update project display with updated milestones
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showSuccess("Milestone updated successfully!");
    } catch (error) {
      console.error("Failed to update milestone:", error);
      showError(
        error instanceof Error ? error.message : "Failed to update milestone"
      );
      throw error;
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      // Optimistically remove milestone from UI
      const updatedMilestones = milestones.filter(
        (m) => String(m.id) !== String(milestoneId)
      );
      setMilestones(updatedMilestones);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      // Delete milestone via repository
      await mutations.handleDeleteMilestone(milestoneId);

      // Reload milestones to ensure consistency
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      // Update project display with server data
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      modals.closeDeleteMilestoneConfirm();
      showSuccess("Milestone deleted successfully!");
    } catch (error) {
      // Rollback on error - reload milestones from server
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      console.error("Failed to delete milestone:", error);
      showError(
        error instanceof Error ? error.message : "Failed to delete milestone"
      );
    }
  };

  const handleAddMilestone = async (
    title: string,
    scope: string,
    dueDate: string,
    amount: string,
    currency?: string
  ) => {
    // Parse amount (remove commas if present)
    const parsedAmount = parseFloat(amount.replace(/,/g, "")) || 0;

    // Create milestone object for immediate client-side update
    // Use numeric ID based on timestamp (will be replaced with server ID later)
    const milestoneId = Date.now();
    const numericProjectId =
      typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
    const newMilestone: MilestoneI = {
      id: milestoneId,
      projectId: numericProjectId,
      title,
      scope: scope || "No scope defined",
      acceptanceCriteria: "To be defined",
      dueDate: new Date(dueDate).toISOString(),
      amount: parsedAmount,
      currency: currency || projectData?.currency, // Use selected currency or project currency
      escrowStatus: "PENDING",
      supervisorGate: false,
      status: "PROPOSED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update milestones state immediately for instant UI feedback
    // Create new array to ensure React detects the change
    const updatedMilestones = [...milestones, newMilestone];

    // Immediately update the project display to include the new milestone
    if (projectData) {
      try {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones, // Use the updated milestones array directly
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        // Force a new object reference to ensure React detects the change
        // Create a completely new object with all properties
        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones], // Ensure new array reference
        };

        // Use setTimeout to ensure state updates happen in next tick
        // This prevents React from batching updates incorrectly
        setTimeout(() => {
          setMilestones(updatedMilestones);
          setProject(newProject);
        }, 0);
      } catch (error) {
        console.error("Failed to transform project:", error);
        // Still update milestones even if transformation fails
        setMilestones(updatedMilestones);
      }
    } else {
      // If no projectData yet, just update milestones
      setMilestones(updatedMilestones);
    }

    try {
      // Create milestone via repository (will persist to backend)
      const currencyCode = currency || projectData?.currency || "UGX";
      await mutations.handleAddMilestone(
        title,
        scope,
        dueDate,
        parsedAmount.toString(),
        async () => {
          // Reload milestones to get server-generated ID if needed
          const projectMilestones = await milestoneService.getProjectMilestones(
            projectId
          );
          setMilestones(projectMilestones);

          // Update project display with server data
          if (projectData) {
            const transformed = await transformProjectForDisplay(
              projectData,
              applications,
              projectMilestones,
              projectId,
              undefined,
              undefined,
              projectData?.supervisorId,
              userId
            );
            setProject(transformed);
          }
        },
        currencyCode
      );
    } catch (error) {
      // Rollback on error - remove the optimistically added milestone
      const rolledBackMilestones = milestones.filter(
        (m) => m.id !== milestoneId
      );
      setMilestones(rolledBackMilestones);

      // Rollback project display
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          rolledBackMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      console.error("Failed to create milestone:", error);
      throw error; // Re-throw to allow modal to handle error state
    }
  };

  const handleSaveProject = async (data: unknown) => {
    setIsSaving(true);
    try {
      const updated = await mutations.handleSaveProject(data);
      if (updated) {
        // Reload project data from server to ensure we have the latest
        const reloadedProject = await projectService.getProjectById(projectId);
        setProjectData(reloadedProject);

        // Reload project display to reflect changes
        if (reloadedProject) {
          const transformed = await transformProjectForDisplay(
            reloadedProject,
            applications,
            milestones,
            projectId,
            undefined,
            undefined,
            reloadedProject?.supervisorId,
            userId
          );
          setProject(transformed);
        }

        modals.closeEditModal();
        showSuccess("Project updated successfully!");
      }
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to update project"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAndRelease = async (milestoneId: string) => {
    try {
      // Update milestone status immediately for instant UI feedback
      const updatedMilestones = milestones.map((m) => {
        // Compare IDs as strings to handle both number and string types
        const mIdStr = String(m.id);
        const targetIdStr = String(milestoneId);
        if (mIdStr === targetIdStr && m.status === "PARTNER_REVIEW") {
          return {
            ...m,
            status: "RELEASED" as const,
            escrowStatus: "RELEASED" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      // Verify the milestone was updated
      const updatedMilestone = updatedMilestones.find(
        (m) => String(m.id) === String(milestoneId)
      );
      if (!updatedMilestone || updatedMilestone.status !== "RELEASED") {
        console.warn("Failed to update milestone status in local state");
      }

      // Update milestones state immediately - this ensures actualStatus updates
      setMilestones([...updatedMilestones]);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones],
        };

        // Update project state immediately for instant UI update
        setProject(newProject);
      }

      // Call the service to persist the change (but don't reload milestones since we've already done optimistic update)
      // The handler normally reloads milestones, but we've already updated them optimistically
      try {
        await milestoneService.approveAndRelease(milestoneId);
      } catch (serviceError) {
        // If service call fails, our optimistic update will be rolled back in the catch block
        throw serviceError;
      }

      // In mock mode, the repository update doesn't persist to JSON, so we keep our optimistic update
      // In production, we would reload from server to get confirmed data
      // The optimistic update already has the correct status (RELEASED)

      showSuccess("Milestone approved successfully!");
    } catch (error) {
      // Rollback on error
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showError(
        error instanceof Error ? error.message : "Failed to approve milestone"
      );
    }
  };

  const handleRequestChanges = async (milestoneId: string) => {
    try {
      // Update milestone status immediately for instant UI feedback
      const updatedMilestones = milestones.map((m) => {
        // Compare IDs as strings to handle both number and string types
        const mIdStr = String(m.id);
        const targetIdStr = String(milestoneId);
        if (mIdStr === targetIdStr && m.status === "PARTNER_REVIEW") {
          return {
            ...m,
            status: "CHANGES_REQUESTED" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      // Update milestones state immediately
      setMilestones([...updatedMilestones]);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones],
        };

        // Update project state immediately for instant UI update
        setProject(newProject);
      }

      // Call the service to persist the change (but don't reload milestones since we've already done optimistic update)
      // The handler normally reloads milestones, but we've already updated them optimistically
      try {
        await milestoneService.requestChanges(milestoneId);
      } catch (serviceError) {
        // If service call fails, our optimistic update will be rolled back in the catch block
        throw serviceError;
      }

      // In mock mode, the repository update doesn't persist to JSON, so we keep our optimistic update
      // In production, we would reload from server to get confirmed data
      // The optimistic update already has the correct status (CHANGES_REQUESTED)

      showSuccess("Changes requested. The team will be notified via chat.");
    } catch (error) {
      // Rollback on error
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showError(
        error instanceof Error ? error.message : "Failed to request changes"
      );
    }
  };

  const handleDisapprove = async (milestoneId: string) => {
    try {
      // Update milestone status immediately for instant UI feedback
      const updatedMilestones = milestones.map((m) => {
        // Compare IDs as strings to handle both number and string types
        const mIdStr = String(m.id);
        const targetIdStr = String(milestoneId);
        if (mIdStr === targetIdStr && m.status === "RELEASED") {
          return {
            ...m,
            status: "PARTNER_REVIEW" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      // Update milestones state immediately - this ensures actualStatus updates
      setMilestones([...updatedMilestones]);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones],
        };

        // Update project state immediately for instant UI update
        setProject(newProject);
      }

      // Call the service to persist the change (but don't reload milestones since we've already done optimistic update)
      // The handler normally reloads milestones, but we've already updated them optimistically
      try {
        await milestoneService.disapproveAndRevert(milestoneId);
      } catch (serviceError) {
        // If service call fails, our optimistic update will be rolled back in the catch block
        throw serviceError;
      }

      // In mock mode, the repository update doesn't persist to JSON, so we keep our optimistic update
      // In production, we would reload from server to get confirmed data
      // The optimistic update already has the correct status (PARTNER_REVIEW)

      showSuccess("Milestone disapproved. Returned to review status.");
    } catch (error) {
      // Rollback on error
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showError(
        error instanceof Error
          ? error.message
          : "Failed to disapprove milestone"
      );
    }
  };

  const handleMarkAsComplete = async (milestoneId: string) => {
    console.log(
      "[useProjectDetailPage] handleMarkAsComplete called for:",
      milestoneId
    );
    try {
      // Update milestone status immediately for instant UI feedback
      // Don't validate status here - let the backend handle validation
      const updatedMilestones = milestones.map((m) => {
        if (String(m.id) === milestoneId) {
          return {
            ...m,
            status: "COMPLETED" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      // Update milestones state immediately
      setMilestones(updatedMilestones);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones],
        };

        // Update project state immediately (not in setTimeout) for instant UI update
        setProject(newProject);
      }

      // Call the service to persist the change to backend
      console.log(
        "[useProjectDetailPage] Calling milestoneService.markAsComplete"
      );
      await milestoneService.markAsComplete(milestoneId);
      console.log(
        "[useProjectDetailPage] milestoneService.markAsComplete completed"
      );

      // Reload milestones from backend to ensure sync
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      // Update project display with backend data
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showSuccess("Milestone marked as complete successfully!");
    } catch (error) {
      // Rollback on error
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showError(
        error instanceof Error
          ? error.message
          : "Failed to mark milestone as complete"
      );
    }
  };

  const handleUnmarkAsComplete = async (milestoneId: string) => {
    console.log(
      "[useProjectDetailPage] handleUnmarkAsComplete called for:",
      milestoneId
    );
    try {
      // Update milestone status immediately for instant UI feedback
      // Don't validate status here - let the backend handle validation
      const updatedMilestones = milestones.map((m) => {
        if (String(m.id) === milestoneId) {
          return {
            ...m,
            status: "RELEASED" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      // Update milestones state immediately
      setMilestones(updatedMilestones);

      // Update project display immediately
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          updatedMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );

        // Set flag to prevent useEffect from overwriting our update
        isManuallyUpdatingProject.current = true;

        const newProject = {
          ...transformed,
          milestones: [...transformed.milestones],
        };

        // Update project state immediately for instant UI update
        setProject(newProject);
      }

      // Call the service to persist the change to backend
      console.log(
        "[useProjectDetailPage] Calling milestoneService.unmarkAsComplete"
      );
      await milestoneService.unmarkAsComplete(milestoneId);
      console.log(
        "[useProjectDetailPage] milestoneService.unmarkAsComplete completed"
      );

      // Reload milestones from backend to ensure sync
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      // Update project display with backend data
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showSuccess("Milestone unmarked successfully!");
    } catch (error) {
      // Rollback on error
      const projectMilestones = await milestoneService.getProjectMilestones(
        projectId
      );
      setMilestones(projectMilestones);

      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          applications,
          projectMilestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      showError(
        error instanceof Error ? error.message : "Failed to unmark milestone"
      );
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    // Capture application before status change for notification details
    const targetApplication = applications.find(
      (app) => app.id === applicationId
    );
    try {
      await mutations.handleAcceptApplication(applicationId);

      // Reload applications to reflect the status change
      const { applicationService } = await import(
        "@/src/services/applicationService"
      );
      const numericProjectId =
        typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      const updatedApps = await applicationService.getProjectApplications(
        numericProjectId
      );
      setApplications(updatedApps);

      // Update project display with new application statuses
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          updatedApps,
          milestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      // Notify students that their application was accepted
      if (targetApplication) {
        const projectTitle = projectData?.title || project?.title || "Project";
        const notificationPromises = targetApplication.studentIds.map(
          (studentId) =>
            notificationService.createNotification({
              userId: studentId,
              type: "success",
              title: "Application Accepted",
              message: `Your application for '${projectTitle}' has been accepted. The university team will reach out with next steps.`,
              link: "/student/my-projects",
            })
        );
        await Promise.all(notificationPromises);
      }

      showSuccess(
        "Application accepted. University Admin/Supervisor will be notified to issue offer."
      );
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to accept application"
      );
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    const targetApplication = applications.find(
      (app) => app.id === applicationId
    );
    try {
      await mutations.handleRejectApplication(applicationId);

      // Reload applications to reflect the status change
      const { applicationService } = await import(
        "@/src/services/applicationService"
      );
      const numericProjectId =
        typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      const updatedApps = await applicationService.getProjectApplications(
        numericProjectId
      );
      setApplications(updatedApps);

      // Update project display with new application statuses
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          updatedApps,
          milestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      // Notify students that their application was rejected
      if (targetApplication) {
        const projectTitle = projectData?.title || project?.title || "Project";
        const notificationPromises = targetApplication.studentIds.map(
          (studentId) =>
            notificationService.createNotification({
              userId: studentId,
              type: "alert",
              title: "Application Update",
              message: `Your application for '${projectTitle}' was not selected. You can explore other projects available in the marketplace.`,
              link: "/student/find",
            })
        );
        await Promise.all(notificationPromises);
      }

      showSuccess("Application rejected.");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to reject application"
      );
    }
  };

  const handleRecommendApplication = async (
    applicationId: number,
    partnerIds?: string[]
  ) => {
    try {
      await mutations.handleRecommendApplication(applicationId, partnerIds);
      const partnerCount = partnerIds?.length || 0;

      if (partnerIds && partnerIds.length > 0) {
        const projectTitle = projectData?.title || project?.title || "Project";
        const notificationPromises = partnerIds.map((partnerId) => {
          const numericPartnerId =
            typeof partnerId === "string"
              ? parseInt(partnerId, 10)
              : Number(partnerId);
          return notificationService.createNotification({
            userId: numericPartnerId,
            type: "info",
            title: "Project Recommendation",
            message: `A partner has recommended an application for '${projectTitle}'. Review and consider reaching out to the applicant.`,
            link: "/partner/projects",
          });
        });
        await Promise.all(notificationPromises);
      }
      showSuccess(
        `Application recommended to ${partnerCount} partner${
          partnerCount !== 1 ? "s" : ""
        } successfully.`
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Failed to recommend application"
      );
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await mutations.handleDeleteProject();
      // Navigation happens in mutations.handleDeleteProject, so success message is shown after navigation
      // Don't show success here as user will be redirected
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to delete project"
      );
      setIsDeleting(false); // Only reset if error (success navigates away)
    }
  };

  const handleReassignProject = async (applicationId: number) => {
    const previouslyAssigned = applications.find(
      (app) => app.status === "ASSIGNED"
    );
    try {
      // Call mutation to update backend
      await mutations.handleReassignProject(applicationId);

      // Reload applications to reflect the status changes
      const { applicationService } = await import(
        "@/src/services/applicationService"
      );
      const numericProjectId =
        typeof projectId === "string" ? parseInt(projectId, 10) : projectId;
      const updatedApps = await applicationService.getProjectApplications(
        numericProjectId
      );
      setApplications(updatedApps);

      // Update project display with new application statuses
      if (projectData) {
        const transformed = await transformProjectForDisplay(
          projectData,
          updatedApps,
          milestones,
          projectId,
          undefined,
          undefined,
          projectData?.supervisorId,
          userId
        );
        setProject(transformed);
      }

      const projectTitle = projectData?.title || project?.title || "Project";
      const newlyAssigned = updatedApps.find((app) => app.id === applicationId);

      const notificationPromises: Promise<unknown>[] = [];

      if (previouslyAssigned && previouslyAssigned.id !== applicationId) {
        previouslyAssigned.studentIds.forEach((studentId) => {
          notificationPromises.push(
            notificationService.createNotification({
              userId: studentId,
              type: "info",
              title: "Project Assignment Updated",
              message: `You have been unassigned from '${projectTitle}'. Please explore other opportunities or wait for further updates.`,
              link: "/student/my-projects",
            })
          );
        });
      }

      if (newlyAssigned) {
        newlyAssigned.studentIds.forEach((studentId) => {
          notificationPromises.push(
            notificationService.createNotification({
              userId: studentId,
              type: "success",
              title: "Project Assigned",
              message: `Your team has been assigned to '${projectTitle}'. Review project details and coordinate with the partner.`,
              link: "/student/my-projects",
            })
          );
        });
      }

      if (notificationPromises.length > 0) {
        await Promise.all(notificationPromises);
      }

      // Close modal after successful update
      modals.closeReassignProjectModal();
      showSuccess("Project reassigned to new group successfully.");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to reassign project"
      );
    }
  };

  /**
   * Handle sending a chat message
   */
  const handleSendChatMessage = async (text: string): Promise<void> => {
    // Get current user ID - use partner user as default if not set
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const usersData = await userRepository.getAll();
        const partnerUser = usersData.find((u) => u.role === "partner");
        if (partnerUser) {
          currentUserId = partnerUser.id;
        } else {
          throw new Error("User not available");
        }
      } catch (error) {
        console.error("Failed to get user:", error);
        throw new Error("User not available");
      }
    }

    // If no thread exists, try to find or create one from assigned application
    let threadIdToUse = chatThreadId;

    if (!threadIdToUse) {
      // Try to find assigned application and use its group ID
      // Check both uppercase and lowercase status, and handle both id and ID properties
      let assignedApp = applications.find((app: any) => {
        const status = (app.status || app.Status || "").toUpperCase();
        return status === "ASSIGNED";
      });

      // If not found in applications array, try projectData
      if (!assignedApp && projectData) {
        const projectApps = (projectData as any).applications || [];
        assignedApp = projectApps.find((app: any) => {
          const status = (app.status || app.Status || "").toUpperCase();
          return status === "ASSIGNED";
        });
      }

      if (assignedApp) {
        // Extract groupId - check multiple possible locations
        // 1. Direct groupId property (camelCase, snake_case, PascalCase)
        // 2. Nested group object's id
        // 3. Group relation if loaded
        const groupId =
          (assignedApp as any).groupId ||
          (assignedApp as any).group_id ||
          (assignedApp as any).GroupID ||
          (assignedApp as any).group?.id ||
          (assignedApp as any).Group?.id ||
          (assignedApp as any).Group?.ID;

        const applicantType =
          (assignedApp as any).applicantType ||
          (assignedApp as any).ApplicantType ||
          "";

        if (groupId) {
          // Use group ID as thread ID (backend uses group IDs for threads)
          threadIdToUse = groupId.toString();
          setChatThreadId(threadIdToUse);
          console.log(
            "Using assigned group ID for chat:",
            threadIdToUse,
            "from application:",
            {
              appId: assignedApp.id || assignedApp.ID,
              applicantType,
              groupId,
            }
          );
        } else {
          // No group ID found - backend should have created one for all assigned applications
          // This might be a timing issue or the application needs to be reassigned
          console.warn("Assigned application found but no groupId:", {
            appId: (assignedApp as any).id || (assignedApp as any).ID,
            applicantType,
            status: (assignedApp as any).status || (assignedApp as any).Status,
            groupId: null,
            hasGroupRelation:
              !!(assignedApp as any).group || !!(assignedApp as any).Group,
            fullApp: assignedApp,
          });

          // Try to reload the application to get fresh data with Group relation
          // Backend automatically creates groups for all assigned applications (both individual and group)
          try {
            const { applicationRepository } = await import(
              "@/src/repositories/applicationRepository"
            );
            const appId = (assignedApp as any).id || (assignedApp as any).ID;
            if (appId) {
              const refreshedApp = await applicationRepository.getById(
                typeof appId === "string" ? parseInt(appId, 10) : appId
              );
              const refreshedGroupId =
                (refreshedApp as any).groupId ||
                (refreshedApp as any).group_id ||
                (refreshedApp as any).GroupID ||
                (refreshedApp as any).group?.id;

              if (refreshedGroupId) {
                threadIdToUse = refreshedGroupId.toString();
                setChatThreadId(threadIdToUse);
                console.log(
                  "Found group ID after reloading application:",
                  threadIdToUse
                );
              } else {
                // Backend should have created a group automatically for all assigned applications
                // If still missing, the application may need to be reassigned to trigger group creation
                throw new Error(
                  "Group ID not available. All assigned applications should have a group for chat. Please try reassigning the application or contact support if the issue persists."
                );
              }
            } else {
              throw new Error(
                "Cannot reload application: missing application ID"
              );
            }
          } catch (reloadError) {
            console.error("Failed to reload application:", reloadError);
            // Backend automatically creates groups for all assigned applications (both individual and group)
            throw new Error(
              "Group ID not available. All assigned applications should have a group for chat. Please try reassigning the application or contact support if the issue persists."
            );
          }
        }
      } else {
        const allApps =
          applications.length > 0
            ? applications
            : (projectData as any)?.applications || [];
        console.warn(
          "No assigned application found. Available applications:",
          allApps.map((app: any) => ({
            id: app.id || app.ID,
            status: app.status || app.Status,
            groupId:
              app.groupId || app.group_id || app.GroupID || app.group?.id,
          }))
        );
        throw new Error(
          "No assigned group found. Please assign a group to this project first."
        );
      }
    }

    try {
      const newMessage = await chatService.sendMessage(
        threadIdToUse,
        currentUserId,
        text
      );
      setChatMessages((prev) => [...prev, newMessage]);

      // Update legacy messages format
      const sender = chatUsers[currentUserId];
      const formattedMessage = {
        id: newMessage.id,
        sender: sender?.name || "You",
        text: newMessage.body,
        timestamp: newMessage.createdAt,
        avatar: sender?.profile?.avatar,
      };
      setMessages((prev) => [...prev.slice(-1), formattedMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      throw new Error(errorMessage);
    }
  };

  return {
    project,
    loading,
    currencySymbol,
    daysUntilDeadline,
    messages,
    chatMessages,
    chatUsers,
    chatThreadId,
    actions,
    mutations,
    modals,
    handlers,
    projectData,
    applications,
    milestones,
    setProjectData,
    setApplications,
    setMilestones,
    handleAddMilestone,
    handleUpdateMilestone,
    handleDeleteMilestone,
    handleSaveProject,
    handleApproveAndRelease,
    handleRequestChanges,
    handleMarkAsComplete,
    handleUnmarkAsComplete,
    handleAcceptApplication,
    handleRejectApplication,
    handleRecommendApplication,
    handleDeleteProject,
    handleReassignProject,
    handleSendChatMessage,
    router,
    isSaving,
    isDeleting,
  };
}
