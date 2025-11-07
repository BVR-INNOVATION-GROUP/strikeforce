/**
 * Custom hook for student groups data
 */
import { useState, useEffect } from "react";
import { GroupI } from "@/src/models/group";
import { UserI } from "@/src/models/user";

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
      try {
        const [groupsData, usersData] = await Promise.all([
          import("@/src/data/mockGroups.json"),
          import("@/src/data/mockUsers.json"),
        ]);

        const userGroups = (groupsData.default as GroupI[]).filter(
          (g) => g.memberIds.includes(userId || "") || g.leaderId === userId
        );
        setGroups(userGroups);

        const usersMap: Record<string, UserI> = {};
        (usersData.default as UserI[]).forEach((u) => {
          usersMap[u.id] = u;
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






