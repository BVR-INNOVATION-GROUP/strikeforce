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
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/src/store";
import { useToast } from "@/src/hooks/useToast";
import { UserI } from "@/src/models/user";
import { validateCredentials } from "@/src/constants/credentials";

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
      // Validate credentials
      if (!validateCredentials(formData.email, formData.password)) {
        showError("Invalid email or password");
        setErrors({ email: "Invalid credentials", password: "Invalid credentials" });
        return;
      }

      // Load mock user data - in production, this would be an API call
      const usersData = await import("@/src/data/mockUsers.json");
      const users = usersData.default as UserI[];

      // Find user by email
      const user = users.find((u) => u.email === formData.email);

      if (!user) {
        showError("User not found");
        setErrors({ email: "User not found", password: "User not found" });
        return;
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
    </AuthLayout>
  );
};

export default LoginPage;

