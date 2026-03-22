"use client";

import React, { useEffect, useState, useMemo } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import Select from "@/src/components/core/Select";
import { OptionI } from "@/src/components/core/Select";
import DataTable from "@/src/components/base/DataTable";
import { Column } from "@/src/components/base/DataTable";
import PieChart from "@/src/components/base/PieChart";
import AreaChart from "@/src/components/base/AreaChart";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import ConfirmationDialog from "@/src/components/base/ConfirmationDialog";
import { userRepository } from "@/src/repositories/userRepository";
import { adminRepository } from "@/src/repositories/adminRepository";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { useToast } from "@/src/hooks/useToast";
import { Users, Shield, Filter, Ban, UserPlus, Trash2, MessageSquare, Info } from "lucide-react";
import Skeleton from "@/src/components/core/Skeleton";
import SuperAdminDirectMessageModal from "@/src/components/base/SuperAdminDirectMessageModal";

/**
 * Super Admin Users - User management, block
 */
export default function SuperAdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [users, setUsers] = useState<UserI[]>([]);
  const [activeUsers, setActiveUsers] = useState<{ id: number; email: string; name: string; role: string; lastLoginAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [userToBlock, setUserToBlock] = useState<UserI | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserI | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dmTargetUser, setDmTargetUser] = useState<UserI | null>(null);
  const [userToView, setUserToView] = useState<UserI | null>(null);

  const pickUserField = (u: UserI, ...keys: string[]): string | undefined => {
    const rec = u as unknown as Record<string, unknown>;
    for (const k of keys) {
      const v = rec[k];
      if (v !== undefined && v !== null && String(v) !== "") return String(v);
    }
    return undefined;
  };

  const formatDateTime = (raw?: string) => {
    if (!raw) return "—";
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleString();
  };

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
        if (!user) return null;
        const isSuperAdmin = user.role === "super-admin";
        const isBlocked = (user as { isBlocked?: boolean }).isBlocked;
        return (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUserToView(user);
              }}
              className="p-1.5 rounded hover:bg-pale text-secondary text-xs flex items-center gap-1"
              title="View user details"
            >
              <Info size={14} />
              View
            </button>
            {!isSuperAdmin && (user.role === "partner" || user.role === "university-admin") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDmTargetUser(user);
                }}
                className="p-1.5 rounded hover:bg-pale text-secondary text-xs flex items-center gap-1"
                title="Direct message"
              >
                <MessageSquare size={14} />
                Message
              </button>
            )}
            {!isSuperAdmin && (isBlocked ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleActivate(user); }}
                disabled={processing}
                className="p-1.5 rounded hover:bg-muted-green text-green-600 text-xs"
                title="Activate"
              >
                Activate
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUserToBlock(user); }}
                className="p-1.5 rounded hover:bg-muted-red text-red-600 text-xs"
                title="Deactivate"
              >
                Deactivate
              </button>
            ))}
            {!isSuperAdmin && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setUserToDelete(user); }}
              className="p-1.5 rounded hover:bg-muted-red text-red-600 text-xs flex items-center gap-1"
              title="Soft delete user (account hidden, history kept)"
            >
              <Trash2 size={14} />
              Delete
            </button>
            )}
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
      showSuccess("User soft-deleted");
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to soft-delete user");
    } finally {
      setProcessing(false);
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
        <PieChart
          title="Users by Role"
          data={stats.byRole.map((d) => ({ name: d.name, value: d.Count }))}
        />
        <AreaChart
          title="User Registrations"
          data={registrationTrendData}
          areas={[{ key: "Users", label: "Users" }]}
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
          onRowClick={(row) => {
            const u = users.find((x) => String(x.id) === row.id);
            if (u) setUserToView(u);
          }}
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
        title="Soft delete user"
        message={
          userToDelete ? (
            <p>
              Soft delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? Their login will be blocked, email archived for uniqueness, and the row marked deleted in the database. Related history and references are kept. This is not a hard purge.
            </p>
          ) : null
        }
        type="danger"
        confirmText="Soft delete"
        loading={processing}
      />

      <Modal
        open={!!userToView}
        handleClose={() => setUserToView(null)}
        title={userToView ? `User #${userToView.id}` : "User details"}
        actions={[
          <Button key="close" onClick={() => setUserToView(null)} className="bg-primary">
            Close
          </Button>,
        ]}
      >
        {userToView && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="opacity-60">Name</dt>
              <dd className="font-medium">{userToView.name}</dd>
            </div>
            <div>
              <dt className="opacity-60">Email</dt>
              <dd className="font-medium break-all">{userToView.email}</dd>
            </div>
            <div>
              <dt className="opacity-60">Role</dt>
              <dd className="font-medium">{userToView.role}</dd>
            </div>
            <div>
              <dt className="opacity-60">Status</dt>
              <dd className="font-medium">
                {(userToView as { isBlocked?: boolean }).isBlocked ? "Blocked" : "Active"}
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Last login</dt>
              <dd className="font-medium">
                {formatDateTime(
                  pickUserField(userToView, "lastLoginAt", "LastLoginAt", "last_login_at")
                )}
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Created</dt>
              <dd className="font-medium">
                {formatDateTime(
                  pickUserField(userToView, "createdAt", "CreatedAt", "created_at") ?? userToView.createdAt
                )}
              </dd>
            </div>
            {(pickUserField(userToView, "universityId", "UniversityId", "university_id") ||
              userToView.universityId != null) && (
              <div>
                <dt className="opacity-60">University ID</dt>
                <dd className="font-medium">
                  {String(userToView.universityId ?? pickUserField(userToView, "universityId", "UniversityId", "university_id"))}
                </dd>
              </div>
            )}
            {(pickUserField(userToView, "orgId", "OrgId", "org_id") || userToView.orgId != null) && (
              <div>
                <dt className="opacity-60">Organization ID</dt>
                <dd className="font-medium">
                  {String(userToView.orgId ?? pickUserField(userToView, "orgId", "OrgId", "org_id"))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </Modal>

      <SuperAdminDirectMessageModal
        open={!!dmTargetUser}
        onClose={() => setDmTargetUser(null)}
        targetUserId={dmTargetUser ? Number(dmTargetUser.id) : null}
        title={dmTargetUser ? `Message ${dmTargetUser.name}` : "Direct message"}
        currentUserId={currentUser?.id}
      />

    </div>
  );
}
