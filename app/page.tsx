"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/src/store";
import { UserI } from "@/src/models/user";
import { useRouter } from "next/navigation";
import Button from "@/src/components/core/Button";

/**
 * Home page - Role selection and initialization
 * In production, this would be a login page
 */
export default function HomePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect if already logged in
    if (user) {
      const roleRoutes: Record<string, string> = {
        partner: "/partner",
        student: "/student",
        supervisor: "/supervisor",
        "university-admin": "/university-admin",
        "super-admin": "/super-admin",
      };
      router.push(roleRoutes[user.role] || "/partner");
    } else {
      // Redirect to login if not authenticated
      router.push("/auth/login");
    }
  }, [user, router]);

  const handleRoleSelect = async (role: UserI["role"]) => {
    // Load mock user data for selected role
    try {
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];
      const mockUser = users.find((u) => u.role === role) || users[0];
      
      setUser(mockUser);

      const roleRoutes: Record<string, string> = {
        partner: "/partner",
        student: "/student",
        supervisor: "/supervisor",
        "university-admin": "/university-admin",
        "super-admin": "/super-admin",
      };
      
      router.push(roleRoutes[role] || "/partner");
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">StrikeForce Platform</h1>
        <p className="text-gray-600 mb-8">Select a role to continue (Demo Mode)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        <div className="p-6 bg-paper rounded-lg shadow-custom border border-custom hover-bg-pale cursor-pointer"
          onClick={() => handleRoleSelect("partner")}>
          <h3 className="font-semibold text-lg mb-2">Partner</h3>
          <p className="text-sm text-gray-600">Submit projects, manage milestones, and fund escrow</p>
        </div>

        <div className="p-6 bg-paper rounded-lg shadow-custom border border-custom hover-bg-pale cursor-pointer"
          onClick={() => handleRoleSelect("student")}>
          <h3 className="font-semibold text-lg mb-2">Student</h3>
          <p className="text-sm text-gray-600">Find projects, form groups, and build your portfolio</p>
        </div>

        <div className="p-6 bg-paper rounded-lg shadow-custom border border-custom hover-bg-pale cursor-pointer"
          onClick={() => handleRoleSelect("supervisor")}>
          <h3 className="font-semibold text-lg mb-2">Supervisor</h3>
          <p className="text-sm text-gray-600">Review requests, approve milestones, and guide students</p>
        </div>

        <div className="p-6 bg-paper rounded-lg shadow-custom border border-custom hover-bg-pale cursor-pointer"
          onClick={() => handleRoleSelect("university-admin")}>
          <h3 className="font-semibold text-lg mb-2">University Admin</h3>
          <p className="text-sm text-gray-600">Manage students, screen applications, and handle disputes</p>
        </div>

        <div className="p-6 bg-paper rounded-lg shadow-custom border border-custom hover-bg-pale cursor-pointer"
          onClick={() => handleRoleSelect("super-admin")}>
          <h3 className="font-semibold text-lg mb-2">Super Admin</h3>
          <p className="text-sm text-gray-600">Approve KYC, audit platform, and resolve disputes</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>This is a demo application with mock data</p>
        <p className="mt-2">Set NEXT_PUBLIC_USE_MOCK=true in .env to use mock data in development</p>
      </div>
    </div>
  );
}
