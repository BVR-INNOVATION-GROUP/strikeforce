"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import BarChart from "@/src/components/base/BarChart";
import LineChart from "@/src/components/base/LineChart";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { userRepository } from "@/src/repositories/userRepository";
import { adminRepository } from "@/src/repositories/adminRepository";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { useToast } from "@/src/hooks/useToast";
import { Users, Shield, UserCog, Filter, Eye, Ban, UserPlus, Trash2 } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";

/**
 * Super Admin Users - User management, block, role change, impersonate
 */
export default function SuperAdminUsersPage() {
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState<UserI[]>([]);
  const [activeUsers, setActiveUsers] = useState<{ id: number; email: string; name: string; role: string; lastLoginAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [userToBlock, setUserToBlock] = useState<UserI | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserI | null>(null);
  const [userToRole, setUserToRole] = useState<{ user: UserI; newRole: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (roleFilter) {
        const data = await userRepository.getByRole(roleFilter);
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const allData = await userRepository.getAll();
        setUsers(Array.isArray(allData) ? allData : []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const data = await adminRepository.getActiveUsers(60);
      setActiveUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setActiveUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const roleOptions: OptionI[] = [
    { label: "All roles", value: "" },
    { label: "Student", value: "student" },
    { label: "Partner", value: "partner" },
    { label: "Supervisor", value: "supervisor" },
    { label: "University Admin", value: "university-admin" },
    { label: "Delegated Admin", value: "delegated-admin" },
    { label: "Super Admin", value: "super-admin" },
  ];

  const stats = useMemo(() => {
    const byRole = new Map<string, number>();
    const blocked = users.filter((u) => (u as any).isBlocked).length;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = users.filter((u) => {
      const created = (u as any).createdAt ?? (u as any).CreatedAt ?? u.createdAt;
      return created && new Date(created) >= thisMonthStart;
    }).length;
    users.forEach((u) => {
      byRole.set(u.role, (byRole.get(u.role) ?? 0) + 1);
    });
    return {
      total: users.length,
      active: activeUsers.length,
      blocked,
      newThisMonth,
      byRole: Array.from(byRole.entries()).map(([name, Count]) => ({ name, Count })),
    };
  }, [users, activeUsers]);

  const registrationTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const count = users.filter((u) => {
        const created = (u as any).createdAt ?? (u as any).CreatedAt ?? u.createdAt;
        if (!created) return false;
        const d = new Date(created);
        return d >= monthDate && d <= monthEnd;
      }).length;
      return {
        name: `${months[monthDate.getMonth()]} ${monthDate.getFullYear().toString().slice(2)}`,
        Users: count,
      };
    });
  }, [users]);

  const tableData = useMemo(
    () =>
      users.map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role,
        blocked: (u as any).isBlocked ? "Yes" : "No",
        lastLogin: (u as any).lastLoginAt ? new Date((u as any).lastLoginAt).toLocaleString() : "—",
      })),
    [users]
  );

  const columns: Column<typeof tableData[0]>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", sortable: true },
    { key: "blocked", header: "Blocked", sortable: true },
    { key: "lastLogin", header: "Last Login", sortable: true },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (item) => {
        const user = users.find((u) => String(u.id) === item.id);
        if (!user || user.role === "super-admin") return null;
        const isBlocked = (user as any).isBlocked;
        return (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleImpersonate(user); }}
              disabled={processing}
              className="p-1.5 rounded hover:bg-pale text-secondary text-xs flex items-center gap-1"
              title="View as user"
            >
              <Eye size={14} />
              View as
            </button>
            {isBlocked ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleActivate(user); }}
                disabled={processing}
                className="p-1.5 rounded hover:bg-muted-green text-green-600 text-xs"
                title="Activate"
              >
                Activate
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setUserToBlock(user); }}
                className="p-1.5 rounded hover:bg-muted-red text-red-600 text-xs"
                title="Deactivate"
              >
                Deactivate
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setUserToRole({ user, newRole: user.role }); }}
              className="p-1.5 rounded hover:bg-pale text-secondary"
              title="Change role"
            >
              <UserCog size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setUserToDelete(user); }}
              className="p-1.5 rounded hover:bg-muted-red text-red-600 text-xs flex items-center gap-1"
              title="Delete"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const handleBlock = async () => {
    if (!userToBlock) return;
    setProcessing(true);
    try {
      await adminRepository.blockUser(Number(userToBlock.id));
      showSuccess("User blocked");
      setUserToBlock(null);
      fetchUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to block user");
    } finally {
      setProcessing(false);
    }
  };

  const handleActivate = async (user: UserI) => {
    setProcessing(true);
    try {
      await adminRepository.unblockUser(Number(user.id));
      showSuccess("User activated");
      fetchUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to activate user");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setProcessing(true);
    try {
      await adminRepository.deleteUser(Number(userToDelete.id));
      showSuccess("User deleted");
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setProcessing(false);
    }
  };

  const handleRoleChange = async () => {
    if (!userToRole) return;
    setProcessing(true);
    try {
      await adminRepository.updateUserRole(Number(userToRole.user.id), userToRole.newRole);
      showSuccess("Role updated");
      setUserToRole(null);
      fetchUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setProcessing(false);
    }
  };

  const handleImpersonate = async (user: UserI) => {
    try {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (currentToken) {
        sessionStorage.setItem("admin_token", currentToken);
      }
      const res = await adminRepository.impersonateUser(Number(user.id));
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      useAuthStore.getState().setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
      } as UserI);
      useAuthStore.getState().setAccessToken(res.token);
      sessionStorage.setItem("impersonating", "true");
      showSuccess(`Viewing as ${res.user.name}`);
      window.location.href = `/${res.user.role}`;
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to impersonate");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="w-full flex flex-col min-h-full">
        <div className="flex-shrink-0 mb-8">
          <Skeleton width={200} height={24} className="mb-2" />
          <Skeleton width={300} height={16} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-shrink-0 mb-8">
        <div>
          <h1 className="text-[1rem] font-[600] mb-2">Users</h1>
          <p className="text-[0.875rem] opacity-60">Manage platform users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users size={20} />} title="Total Users" value={stats.total} />
        <StatCard icon={<Shield size={20} />} title="Active (1h)" value={stats.active} />
        <StatCard icon={<Ban size={20} />} title="Blocked" value={stats.blocked} />
        <StatCard icon={<UserPlus size={20} />} title="New This Month" value={stats.newThisMonth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          title="Users by Role"
          data={stats.byRole}
          bars={[{ key: "Count", label: "Count" }]}
        />
        <LineChart
          title="User Registrations"
          data={registrationTrendData}
          lines={[{ key: "Users", label: "Users" }]}
        />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="min-w-[200px]">
          <Select
            title="Role"
            options={roleOptions}
            value={roleFilter}
            onChange={(opt) => setRoleFilter(typeof opt === "object" ? String(opt.value) : opt)}
            placeHolder="All roles"
          />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        <DataTable
          data={tableData}
          columns={columns}
          showCheckboxes={false}
          showActions={false}
          pageSize={10}
          emptyMessage="No users found"
        />
      </Card>

      <ConfirmationDialog
        open={!!userToBlock}
        onClose={() => setUserToBlock(null)}
        onConfirm={handleBlock}
        title="Deactivate User"
        message={
          userToBlock ? (
            <p>
              Deactivate <strong>{userToBlock.name}</strong> ({userToBlock.email})? They will not be able to log in.
            </p>
          ) : null
        }
        type="danger"
        confirmText="Deactivate"
        loading={processing}
      />

      <ConfirmationDialog
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={
          userToDelete ? (
            <p>
              Permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This will remove all associated data (students, projects, organizations, etc.). This cannot be undone.
            </p>
          ) : null
        }
        type="danger"
        confirmText="Delete"
        loading={processing}
      />

      <Modal
        open={!!userToRole}
        handleClose={() => setUserToRole(null)}
        title="Change Role"
        actions={[
          <Button key="cancel" onClick={() => setUserToRole(null)} className="bg-pale">
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleRoleChange}
            disabled={!userToRole?.newRole}
            className="bg-primary"
            loading={processing}
          >
            Update
          </Button>,
        ]}
      >
        {userToRole && (
          <div className="space-y-4">
            <p>
              Change role for <strong>{userToRole.user.name}</strong> ({userToRole.user.email})
            </p>
            <Select
              title="New Role"
              value={userToRole.newRole}
              onChange={(val) => setUserToRole({ ...userToRole, newRole: String(val) })}
              options={roleOptions.filter((o) => o.value)}
            />
          </div>
        )}
      </Modal>

    </div>
  );
}
