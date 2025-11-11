/**
 * Sign Up Page - Redirects to partner or university signup
 * Students are created by company admin and receive invitation links
 */
"use client";

import React from "react";
import Link from "next/link";
import AuthLayout from "@/src/components/base/AuthLayout";
import Button from "@/src/components/core/Button";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const router = useRouter();

  return (
    <AuthLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2 text-center">Create account</h1>
        <p className="text-sm opacity-60 mb-8 text-center">
          Choose your organization type to get started
        </p>

        {/* Organization Type Selection */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => router.push("/auth/signup/partner")}
            className="w-full p-6 rounded-lg border-2 border-custom hover:border-primary/50 transition-all text-left bg-paper"
          >
            <div className="font-semibold text-lg mb-2">Partner Organization</div>
            <div className="text-sm opacity-60">
              Register your company to post projects and collaborate with students
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/signup/university")}
            className="w-full p-6 rounded-lg border-2 border-custom hover:border-primary/50 transition-all text-left bg-paper"
          >
            <div className="font-semibold text-lg mb-2">University</div>
            <div className="text-sm opacity-60">
              Register your university to connect students with partner organizations
            </div>
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-pale-primary rounded-lg">
          <p className="text-xs text-primary">
            <strong>Note:</strong> Students are invited by university administrators.
            If you are a student, check your email for an invitation link.
          </p>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm opacity-60">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;

