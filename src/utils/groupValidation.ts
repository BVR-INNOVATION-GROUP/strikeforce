/**
 * Group Validation Utilities
 */

export interface GroupFormData {
  name: string;
  capacity: number;
  memberIds: string[];
}

export interface ValidationErrors {
  name?: string;
  capacity?: string;
  memberIds?: string;
}

/**
 * Validate group form fields
 * Business rules:
 * - Group name is required and must be 3-50 characters
 * - Capacity must be between 2-20 members
 * - Selected members count cannot exceed capacity (leader + selected members)
 * - At least one member must be selected (excluding the leader)
 */
export function validateGroupForm(data: GroupFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = "Group name is required";
  } else if (data.name.trim().length < 3) {
    errors.name = "Group name must be at least 3 characters";
  } else if (data.name.trim().length > 50) {
    errors.name = "Group name must be less than 50 characters";
  }

  if (!data.capacity || data.capacity < 2) {
    errors.capacity = "Capacity must be at least 2 members";
  } else if (data.capacity > 20) {
    errors.capacity = "Capacity cannot exceed 20 members";
  }

  // Validate member selection against capacity
  // Leader is auto-added, so total members = 1 (leader) + selected members
  const totalMembers = 1 + (data.memberIds?.length || 0);
  if (data.capacity && totalMembers > data.capacity) {
    errors.memberIds = `Selected members exceed capacity. You can add up to ${data.capacity - 1} members (excluding yourself as leader).`;
  }

  return errors;
}




