"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/src/components/core/Button";
import { Building2, GraduationCap } from "lucide-react";

/**
 * Home page - Signup options for University Admin or Partner
 * PRD Reference: Section 4 - Organizations sign up → submit KYC → Super Admin approval
 */
export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pale p-8">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-primary">StrikeForce Platform</h1>
          <p className="text-xl text-gray-600 mb-2">
            Connect universities, students, and partner organizations
          </p>
          <p className="text-sm text-gray-500">
            Execute real-world, milestone-based projects with portfolio tracking and escrow-backed payments
          </p>
        </div>

        {/* Signup Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner Signup */}
          <div className="bg-paper rounded-lg shadow-custom border border-custom p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Partner Organization</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Submit projects, negotiate milestones, fund escrow, and collaborate with students.
              Perfect for organizations looking to execute real-world projects.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Submit and manage projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Negotiate milestones via chat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Fund escrow and release payments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Review student work and portfolios</span>
              </li>
            </ul>
            <Button
              onClick={() => router.push("/auth/signup/partner")}
              className="w-full bg-primary"
            >
              Sign Up as Partner
            </Button>
          </div>

          {/* University Admin Signup */}
          <div className="bg-paper rounded-lg shadow-custom border border-custom p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <GraduationCap size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold">University Admin</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Onboard supervisors and students, screen applications, manage disputes, and oversee
              project assignments. Perfect for educational institutions.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Onboard supervisors and students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Screen and shortlist applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Manage disputes and policies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Track project progress and outcomes</span>
              </li>
            </ul>
            <Button
              onClick={() => router.push("/auth/signup/university")}
              className="w-full bg-primary"
            >
              Sign Up as University Admin
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
