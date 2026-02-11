/**
 * Custom hook for group creation logic
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { OptionI } from "@/src/components/base/MultiSelect";
import {
  validateGroupForm,
  GroupFormData,
  ValidationErrors,
} from "@/src/utils/groupValidation";
import { useToast } from "@/src/hooks/useToast";
import { groupService } from "@/src/services/groupService";
import { userRepository } from "@/src/repositories/userRepository";
import { useAuthStore } from "@/src/store";

export interface UseGroupCreationResult {
  formData: GroupFormData;
  errors: ValidationErrors;
  availableMembers: OptionI[];
  usersMap: Record<string, UserI>;
  loadingMembers: boolean;
  setFormData: (data: GroupFormData) => void;
  updateMembers: (memberIds: string[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  handleCreateGroup: (
    userId: string,
    courseId: string | undefined,
    onSuccess: (group: GroupI) => void
  ) => void;
  handleSearchMembers: (query: string) => void;
  reset: () => void;
}

/**
 * Hook for managing group creation state and logic
 * Loads available students for member selection and handles form state
 */
export function useGroupCreation(
  isModalOpen: boolean,
  currentUserId?: string | null
): UseGroupCreationResult {
  const { organization, user } = useAuthStore();
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    capacity: 5,
    memberIds: [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [usersMap, setUsersMap] = useState<Record<string, UserI>>({});
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showSuccess, showError } = useToast();

  /**
   * Load students via search endpoint
   * Only called when user types (not on page load)
   * Uses search endpoint to fetch students with search query
   * Filters by same university as logged-in user
   * Always excludes the logged-in user from results
   */
  const loadStudents = useCallback(
    async (query: string) => {
      // Don't search if query is empty - clear results but keep current user for leader avatar
      if (!query || query.trim().length === 0) {
        setUsersMap((prev) => {
          const currentUserIdStr = currentUserId ? String(currentUserId) : null;
          if (!currentUserIdStr) return {};
          const currentUserInMap = prev[currentUserIdStr];
          return currentUserInMap ? { [currentUserIdStr]: currentUserInMap } : {};
        });
        setLoadingMembers(false);
        return;
      }

      setLoadingMembers(true);
      try {
        // Get university/organization ID from auth store
        const universityId = organization?.id;
        const currentUserIdStr = currentUserId ? String(currentUserId) : null;

        // Use search endpoint to fetch students from same university
        const students = await userRepository.search({
          role: "student",
          search: query.trim(), // Search query is required
          limit: 100, // Get up to 100 students
          universityId: universityId, // Filter by same university
        });

        // Create users map for quick lookup, excluding current user
        // But preserve current user if already in map (for leader avatar display)
        setUsersMap((prevMap) => {
          const map: Record<string, UserI> = {};
          const currentUserInMap = currentUserIdStr
            ? prevMap[currentUserIdStr]
            : null;

          students.forEach((u) => {
            const userIdStr = String(u.id);
            // Always exclude the logged-in user from search results
            if (currentUserIdStr && userIdStr === currentUserIdStr) {
              return; // Skip current user
            }
            map[userIdStr] = u;
          });

          // Preserve current user in map if it exists (for leader avatar)
          if (currentUserInMap) {
            map[currentUserIdStr!] = currentUserInMap;
          }

          return map;
        });
        console.log("Loaded students for group creation:", {
          query,
          universityId,
          count: students.length,
        });
      } catch (error) {
        console.error("Failed to load available students:", error);
        setUsersMap({});
      } finally {
        setLoadingMembers(false);
      }
    },
    [organization, currentUserId]
  );

  /**
   * Preload current user into usersMap when modal opens
   * This ensures the leader avatar is displayed immediately
   */
  useEffect(() => {
    if (isModalOpen && user && currentUserId) {
      const userIdStr = String(user.id);
      setUsersMap((prev) => {
        // Only add if not already present
        if (!prev[userIdStr]) {
          return {
            ...prev,
            [userIdStr]: user,
          };
        }
        return prev;
      });
    }
  }, [isModalOpen, user, currentUserId]);

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!isModalOpen) {
      // Clear any pending search so we don't fire after close
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      setSearchQuery("");
      setUsersMap({});
      setLoadingMembers(false);
    }
  }, [isModalOpen]);

  /**
   * Handle search with debouncing
   * Show loading immediately when user types so "Searching..." appears before "No options found"
   */
  const handleSearchMembers = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (query.trim().length > 0) {
        setLoadingMembers(true);
      } else {
        setLoadingMembers(false);
      }

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search - wait 300ms after user stops typing
      searchTimeoutRef.current = setTimeout(() => {
        loadStudents(query);
      }, 300);
    },
    [loadStudents]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Get available members as options for MultiSelect
   * Shows all students from all campuses/courses, excluding current user
   * Selected members are included in the list (they'll be highlighted in MultiSelect)
   */
  const availableMembers = useMemo(() => {
    const options: OptionI[] = [];
    const currentUserIdStr = currentUserId ? String(currentUserId) : null;

    // Process all users in the map (only include users with valid id - backend may return ID)
    Object.values(usersMap).forEach((user) => {
      const uid = user.id ?? (user as { ID?: number }).ID;
      if (uid === undefined || uid === null || Number.isNaN(Number(uid))) return;

      const userIdStr = String(uid);
      if (user.role !== "student") return;
      if (currentUserIdStr && userIdStr === currentUserIdStr) return;

      options.push({
        label: user.name || `Student ${uid}`,
        value: typeof uid === "number" ? uid : Number(uid),
      });
    });

    console.log("Available members for group creation:", {
      totalUsers: Object.keys(usersMap).length,
      studentsFound: options.length,
      currentUserId,
      sampleOptions: options.slice(0, 3),
    });

    return options;
  }, [usersMap, currentUserId]);

  const validate = (): boolean => {
    const validationErrors = validateGroupForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof ValidationErrors];
      return newErrors;
    });
  };

  /**
   * Update selected members
   * Validates against capacity before updating
   */
  const updateMembers = (memberIds: string[]) => {
    // Validate against capacity (leader + selected members)
    const totalMembers = 1 + memberIds.length;
    if (formData.capacity && totalMembers > formData.capacity) {
      setErrors((prev) => ({
        ...prev,
        memberIds: `Selected members exceed capacity. You can add up to ${
          formData.capacity - 1
        } members (excluding yourself as leader).`,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, memberIds }));
    clearError("memberIds");
  };

  const handleCreateGroup = async (
    userId: string,
    courseId: string | undefined,
    onSuccess: (group: GroupI) => void
  ) => {
    console.log("handleCreateGroup called:", { userId, courseId, formData });

    if (!validate()) {
      console.log("Validation failed:", errors);
      showError("Please fix the errors before creating the group");
      return;
    }

    if (!courseId) {
      console.log("Course ID missing");
      showError("Course ID is required");
      return;
    }

    try {
      // Convert IDs to numbers
      const numericUserId =
        typeof userId === "string" ? parseInt(userId, 10) : userId;
      const numericCourseId =
        typeof courseId === "string" ? parseInt(courseId, 10) : courseId;
      const numericMemberIds = formData.memberIds.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );

      console.log("Calling groupService.createGroup with:", {
        courseId: numericCourseId,
        leaderId: numericUserId,
        memberIds: numericMemberIds,
        name: formData.name.trim(),
        capacity: formData.capacity,
      });

      // Use groupService to create group with business validation
      const newGroup = await groupService.createGroup({
        courseId: numericCourseId,
        leaderId: numericUserId,
        memberIds: numericMemberIds,
        name: formData.name.trim(),
        capacity: formData.capacity,
      });

      console.log("Group created successfully:", newGroup);
      onSuccess(newGroup);
      showSuccess("Group created successfully!");
      reset();
    } catch (error) {
      console.error("Failed to create group:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      showError(
        error instanceof Error
          ? error.message
          : "Failed to create group. Please try again."
      );
    }
  };

  const reset = () => {
    setFormData({ name: "", capacity: 5, memberIds: [] });
    setErrors({});
  };

  return {
    formData,
    errors,
    availableMembers,
    usersMap,
    loadingMembers,
    setFormData,
    updateMembers,
    clearError,
    validate,
    handleCreateGroup,
    handleSearchMembers,
    reset,
  };
}
