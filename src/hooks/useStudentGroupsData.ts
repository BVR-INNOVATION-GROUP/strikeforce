/**
 * Custom hook for student groups data
 */
import { useState, useEffect } from "react";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";
import { groupService } from "@/src/services/groupService";
import { userRepository } from "@/src/repositories/userRepository";

export interface UseStudentGroupsDataResult {
  groups: GroupI[];
  users: Record<string, UserI>;
  loading: boolean;
}

/**
 * Hook for loading student groups data
 */
export function useStudentGroupsData(
  userId: string | null
): UseStudentGroupsDataResult {
  const [groups, setGroups] = useState<GroupI[]>([]);
  const [users, setUsers] = useState<Record<string, UserI>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Load groups and users in parallel
        const [userGroups, allUsers] = await Promise.all([
          groupService.getUserGroups(),
          userRepository.getAll(),
        ]);

        setGroups(userGroups);

        // Create users map for quick lookup
        const usersMap: Record<string, UserI> = {};
        allUsers.forEach((u) => {
          const userIdStr = String(u.id);
          usersMap[userIdStr] = u;
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Failed to load groups:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  return { groups, users, loading };
}






