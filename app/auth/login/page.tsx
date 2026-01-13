/**
 * Login Page - User authentication
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/src/components/base/AuthLayout";
import Input from "@/src/components/core/Input";
import Button from "@/src/components/core/Button";
import Modal from "@/src/components/base/Modal";
import { POST, ApiError } from "@/base/index"
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";
import { OrganizationI } from "@/src/models/organization";
import { BackendLoginResponse, mapBackendUserToFrontend, mapBackendOrganizationToFrontend } from "@/src/lib/server";
import DNASnapshotModal, { DNAArchetype } from "@/src/components/screen/student/DNASnapshotModal";

interface User {
  name: string
  email: string
  id: number
}

const LoginPage = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingOrganization, setPendingOrganization] = useState<OrganizationI | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDNAModal, setShowDNAModal] = useState(false);

  /**
   * Check if input is an email or student ID
   */
  const isEmail = (input: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  /**
   * Check if input is a student ID format (e.g., 2024CS-UG-KMP-0001-5)
   */
  const isStudentID = (input: string): boolean => {
    // Student ID format: YEARCODE-BRANCH-DISTRICT-SEQUENCE-CHECKSUM
    // Example: 2024CS-UG-KMP-0001-5
    const studentIDPattern = /^\d{4}[A-Z]{2,4}-[A-Z0-9]{2,3}-[A-Z]{3}-\d{4}-\d$/;
    return studentIDPattern.test(input);
  };

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email or Student ID is required";
    } else if (!isEmail(formData.email) && !isStudentID(formData.email)) {
      newErrors.email = "Please enter a valid email or student ID";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
  //  */
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validate()) {
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const { msg, status, data } = await POST<{ email: string, password: string, user?: User, token?: string }>("user/login", {
  //       email: formData.email,
  //       password: formData.password
  //     })

  //     if (status != 200) {
  //       showError(msg)
  //       return
  //     }

  //     localStorage.setItem("token", data?.token ?? "")
  //     localStorage.setItem("user", JSON.stringify(data.user))

  //     window.location.href = "/"

  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     showError("Login failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Determine if input is email or student ID
      const loginPayload = isEmail(formData.email)
        ? { email: formData.email, password: formData.password }
        : { studentId: formData.email, password: formData.password };

      const response = await POST<BackendLoginResponse>("user/login", loginPayload);

      const { data, msg } = response;
      if (!data) {
        showError(msg || "Unexpected response from server.");
        return;
      }

      // Set token FIRST
      const { setUser, setAccessToken, setOrganization } = useAuthStore.getState();
      setAccessToken(data.token);
      localStorage.setItem("token", data?.token)

      console.log(mapBackendUserToFrontend(data.user))

      if (data.organization) {
        const organization = mapBackendOrganizationToFrontend(data.organization);
        setOrganization(organization);
      } else {
        setOrganization(null);
      }

      // Then set user (this might be async if fetching org)
      await setUser(mapBackendUserToFrontend(data.user));

      console.log("Auth state after login:", useAuthStore.getState()); // Debug log

      // Check if this is a first-time student login
      if (data.user.role === "student" && data.isFirstLogin) {
        setShowDNAModal(true);
      } else {
        // Navigate to home
        showSuccess("Welcome back!");
        router.push("/");
      }

    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof ApiError) {
        const backendMsg =
          (error.payload?.msg &&
            error.payload.msg.replace(/^\[\d+\]\s*/, "").trim()) ||
          error.message.replace(/^\[\d+\]\s*/, "").trim() ||
          "Login failed. Please try again.";

        if (error.status === 403) {
          const pendingOrg = (error.payload?.data as BackendLoginResponse | undefined)?.organization;
          if (pendingOrg) {
            setPendingOrganization(mapBackendOrganizationToFrontend(pendingOrg));
            setShowPendingModal(true);
          }
        }

        showError(backendMsg);
        return;
      }

      showError(error instanceof Error ? error.message : "Login failed. Please try again.");
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
          "A collaboration system enabling universities, students, and partners to run real-world projects efficiently — with traceable outcomes and verified participants.",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center text-[var(--text)]">Log in</h1>
        <p className="text-sm text-muted mb-6 text-center">
          Enter your credentials to access your account
        </p>

        {/* Role Selection Info */}


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            title="Email or Student ID *"
            placeholder="Enter your email or student ID"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              clearError("email");
            }}
            error={errors.email}
          />

          <Input
            type={showPassword ? "text" : "password"}
            title="Password *"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              clearError("password");
            }}
            error={errors.password}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            }
          />

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
            onClick={handleSubmit}
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-white mt-6"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-light">
          Powered by BVR Innovation Group
        </p>
      </div>

      {/* Pending Approval Modal */}
      <Modal
        open={showPendingModal}
        handleClose={() => {
          setShowPendingModal(false);
          setPendingOrganization(null);
        }}
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
            onClick={() => {
              setShowPendingModal(false);
              setPendingOrganization(null);
            }}
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
            If you have unknown questions, please contact our support team.
          </p>
        </div>
      </Modal>

      {/* DNA Snapshot Modal for first-time student logins */}
      <DNASnapshotModal
        open={showDNAModal}
        onClose={() => {
          setShowDNAModal(false);
          // Navigate to home after closing
          showSuccess("Welcome to StrikeForce!");
          router.push("/");
        }}
        onComplete={(archetype: DNAArchetype) => {
          setShowDNAModal(false);
          showSuccess(`Welcome! Your StrikeForce DNA: ${archetype.name}`);
          router.push("/");
        }}
      />
    </AuthLayout>
  );
};

export default LoginPage;

