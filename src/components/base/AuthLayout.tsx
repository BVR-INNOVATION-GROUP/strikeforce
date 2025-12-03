/**
 * AuthLayout - Two-column layout for authentication screens
 * Left: Form content, Right: Promotional/inspirational content with company logos
 */
"use client";

import React, { ReactNode } from "react";
import Logo from "./Logo";
import CompanyLogosScroll from "./CompanyLogosScroll";
import { Star } from "lucide-react";

export interface AuthLayoutProps {
  children: ReactNode;
  rightContent?: {
    title: string;
    description: string;
    image?: string;
    stats?: {
      rating: number;
      reviews: number;
    };
  };
}

/**
 * Default promotional content for auth screens
 */
const defaultRightContent = {
  title: "Start turning your ideas into reality.",
  description:
    "Connect with talented students, collaborate on real-world projects, and build meaningful partnerships. Join our growing community of partners, students, and universities.",
  stats: {
    rating: 5.0,
    reviews: 200,
  },
};

const AuthLayout = ({ children, rightContent = defaultRightContent }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-pale">
      {/* Left Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-paper">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Logo />
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Column - Promotional with Company Logos */}
      <div className="hidden lg:flex lg:w-1/2 bg-pale relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/129208/pexels-photo-129208.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Collaboration"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[var(--text)]/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-16 py-16">
          <div className="space-y-5 max-w-xl">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              Welcome back
            </p>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              {rightContent.title}
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              {rightContent.description}
            </p>
          </div>

          <div className="mt-10 space-y-8 max-w-xl">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase mb-4">
                Trusted by leading organizations
              </p>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <CompanyLogosScroll />
              </div>
            </div>

            {rightContent.stats && (
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{rightContent.stats.rating} / 5.0</p>
                  <p className="text-white/70">from {rightContent.stats.reviews}+ reviews</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-10 pb-4">
            <p className="text-xs text-white/70 tracking-wide">
              Powered by <span className="font-semibold text-white">BVR Innovation Group</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

