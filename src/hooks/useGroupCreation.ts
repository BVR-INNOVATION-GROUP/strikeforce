/**
 * Custom hook for group creation logic
 */
import { useState, useEffect, useMemo } from "react";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { OptionI } from "@/src/components/base/MultiSelect";
import { validateGroupForm, GroupFormData, ValidationErrors } from "@/src/utils/groupValidation";
import { useToast } from "@/src/hooks/useToast";

export interface UseGroupCreationResult {
  formData: GroupFormData;
  errors: ValidationErrors;
  availableMembers: OptionI[];
  usersMap: Record<string, UserI>;
  setFormData: (data: GroupFormData) => void;
  updateMembers: (memberIds: string[]) => void;
  clearError: (field: string) => void;
  validate: () => boolean;
  handleCreateGroup: (userId: string, courseId: string | undefined, onSuccess: (group: GroupI) => void) => void;
  reset: () => void;
}

/**
 * Hook for managing group creation state and logic
 * Loads available students for member selection and handles form state
 */
export function useGroupCreation(isModalOpen: boolean, currentUserId?: string | null): UseGroupCreationResult {
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    capacity: 5,
    memberIds: [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [usersMap, setUsersMap] = useState<Record<string, UserI>>({});
  const { showSuccess, showError } = useToast();

  /**
   * Load available students when modal opens
   * Filters students by same course and excludes current user
   */
  useEffect(() => {
    if (isModalOpen) {
      loadAvailableStudents();
    } else {
      reset();
    }
  }, [isModalOpen]);

  /**
   * Load available students for member selection
   * Only shows students from the same course, excluding the current user
   */
  const loadAvailableStudents = async () => {
    try {
      const usersData = await import("@/src/data/mockUsers.json");
      const allUsers = usersData.default as UserI[];
      
      // Create users map for quick lookup
      const map: Record<string, UserI> = {};
      allUsers.forEach((u) => {
        map[u.id] = u;
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to load available students:", error);
    }
  };

  /**
   * Get available members as options for MultiSelect
   * Filters students by same course and excludes current user
   * Selected members are included in the list (they'll be highlighted in MultiSelect)
   */
  const availableMembers = useMemo(() => {
    const currentUser = currentUserId ? usersMap[currentUserId] : null;
    if (!currentUser) return [];

    const options: OptionI[] = [];
    
    Object.values(usersMap).forEach((user) => {
      // Only include students from the same course
      // Exclude only the current user (selected members remain visible for deselection)
      if (
        user.role === "student" &&
        user.id !== currentUserId &&
        user.courseId === currentUser.courseId
      ) {
        options.push({
          label: user.name,
          value: user.id,
        });
      }
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
        memberIds: `Selected members exceed capacity. You can add up to ${formData.capacity - 1} members (excluding yourself as leader).`,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, memberIds }));
    clearError("memberIds");
  };

  const handleCreateGroup = (
    userId: string,
    courseId: string | undefined,
    onSuccess: (group: GroupI) => void
  ) => {
    if (!validate()) {
      showError("Please fix the errors before creating the group");
      return;
    }

    // Create group with leader + selected members
    const newGroup: GroupI = {
      id: `group-${Date.now()}`,
      courseId: courseId || "",
      leaderId: userId,
      memberIds: [userId, ...formData.memberIds], // Leader is first, then selected members
      name: formData.name.trim(),
      capacity: formData.capacity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSuccess(newGroup);
    showSuccess("Group created successfully!");
    reset();
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
    setFormData,
    updateMembers,
    clearError,
    validate,
    handleCreateGroup,
    reset,
  };
}




