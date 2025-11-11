/**
 * AuthLayout - Two-column layout for authentication screens
 * Left: Form content, Right: Promotional/inspirational content
 */
"use client";

import React, { ReactNode } from "react";
import Logo from "./Logo";
import { Sparkles, Star } from "lucide-react";

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

      {/* Right Column - Promotional */}
      <div className="hidden lg:flex lg:flex-1 bg-pale relative overflow-hidden">
        {/* Background Image/Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-pale-primary to-pale/50" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <div className="w-32 h-32 border-2 border-primary rounded-lg rotate-12" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-15">
          <div className="w-24 h-24 border-2 border-primary rounded-lg -rotate-12" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-10">
          <Sparkles size={40} className="text-primary" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Main Tagline */}
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 text-primary max-w-lg">
            {rightContent.title}
          </h2>

          {/* Description */}
          <p className="text-lg opacity-70 mb-8 max-w-lg leading-relaxed">
            {rightContent.description}
          </p>

          {/* Social Proof */}
          {rightContent.stats && (
            <div className="flex items-center gap-4">
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/20 border-2 border-paper flex items-center justify-center text-xs font-semibold text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="font-semibold">{rightContent.stats.rating}</span>
                <span className="text-sm opacity-60">
                  from {rightContent.stats.reviews}+ reviews
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

