/**
 * Login Page - User authentication
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import Modal from "@/src/components/base/Modal";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";
import { UserI } from "@/src/models/user";
import { organizationRepository } from "@/src/repositories/organizationRepository";
import { OrganizationI } from "@/src/models/organization";

const LoginPage = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingOrganization, setPendingOrganization] = useState<OrganizationI | null>(null);

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Load mock user data - in production, this would be an API call
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];

      // Find user by email
      const user = users.find((u) => u.email.toLowerCase() === formData.email.toLowerCase());

      // Validate credentials against user data
      if (!user || !user.password || user.password !== formData.password) {
        showError("Invalid email or password");
        setErrors({ email: "Invalid credentials", password: "Invalid credentials" });
        return;
      }

      // Check organization approval status for partner and university-admin roles
      if ((user.role === "partner" || user.role === "university-admin") && user.orgId) {
        try {
          const organization = await organizationRepository.getById(user.orgId);

          // If organization is not approved, show modal and don't create session
          if (organization.kycStatus !== "APPROVED") {
            setPendingOrganization(organization);
            setShowPendingModal(true);
            return; // Don't create session
          }
        } catch (error) {
          console.error("Failed to fetch organization:", error);
          // If we can't fetch organization, allow login but log the error
          // In production, you might want to handle this differently
        }
      }

      // Set user in auth store and cookie for middleware
      setUser(user);

      // Set cookie for middleware (in production, this would be handled by NextAuth)
      document.cookie = `user=${JSON.stringify({ role: user.role, id: user.id })}; path=/; max-age=86400`; // 24 hours

      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        partner: "/partner",
        student: "/student",
        supervisor: "/supervisor",
        "university-admin": "/university-admin",
        "super-admin": "/super-admin",
      };

      showSuccess("Login successful!");
      router.push(roleRoutes[user.role] || "/partner");
    } catch (error) {
      console.error("Login failed:", error);
      showError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error for a specific field
   */
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return (
    <AuthLayout
      rightContent={{
        title: "Welcome back to StrikeForce",
        description:
          "Continue your journey of collaboration and innovation. Connect with students, manage your projects, and build lasting partnerships that drive real impact.",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center">Log in</h1>
        <p className="text-sm opacity-60 mb-8 text-center">
          Enter your credentials to access your account
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            title="Email *"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              clearError("email");
            }}
            error={errors.email}
          />

          <div className="relative">
            <Input
              type="password"
              title="Password *"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                clearError("password");
              }}
              error={errors.password}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary mt-6"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm opacity-60">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Pending Approval Modal */}
      <Modal
        open={showPendingModal}
        handleClose={() => setShowPendingModal(false)}
        title={
          pendingOrganization?.kycStatus === "REJECTED"
            ? "Account Not Approved"
            : pendingOrganization?.kycStatus === "EXPIRED"
              ? "Account Approval Expired"
              : "Account Pending Approval"
        }
        actions={[
          <Button
            key="close"
            onClick={() => setShowPendingModal(false)}
            className="bg-primary"
          >
            Close
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {pendingOrganization?.kycStatus === "PENDING" && (
            <>
              <p>
                Your organization <strong>{pendingOrganization.name}</strong> is currently pending Super Admin approval.
              </p>
              <p className="text-sm text-muted">
                You will receive an email notification once your account has been approved.
                Until then, you cannot access the dashboard.
              </p>
            </>
          )}
          {pendingOrganization?.kycStatus === "REJECTED" && (
            <>
              <p>
                Your organization <strong>{pendingOrganization.name}</strong> has been rejected by Super Admin.
              </p>
              <p className="text-sm text-muted">
                Please contact our support team for more information about the rejection and how to proceed.
              </p>
            </>
          )}
          {pendingOrganization?.kycStatus === "EXPIRED" && (
            <>
              <p>
                Your organization <strong>{pendingOrganization.name}</strong> approval has expired.
              </p>
              <p className="text-sm text-muted">
                Please contact our support team to renew your account approval.
              </p>
            </>
          )}
          <p className="text-sm text-muted">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </Modal>
    </AuthLayout>
  );
};

export default LoginPage;

