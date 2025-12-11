"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/src/components/core/Button";
import { useAuthStore } from "@/src/store";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  Briefcase,
  Target,
  TrendingUp,
  Shield,
  Clock,
  FileCheck,
  DollarSign,
  Award,
  MessageSquare,
  BarChart3
} from "lucide-react";

/**
 * Landing Page - Learning page explaining StrikeForce
 * Modern, clean design following 60-30-10 color rule with primary color (#e9226e)
 * Uses theme colors: --pale, --paper, --primary
 * Improved contrast throughout with smooth animations
 */
const dashboardRoutes: Record<string, string> = {
  partner: "/partner",
  student: "/student/find",
  supervisor: "/supervisor",
  "university-admin": "/university-admin",
  "delegated-admin": "/university-admin",
  "super-admin": "/super-admin",
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const router = useRouter();
  const [isOnHero, setIsOnHero] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const whatIsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const isLoggedIn = Boolean(user);
  const dashboardRoute = user ? dashboardRoutes[user.role] || "/partner" : "/auth/login";

  const isWhatIsInView = useInView(whatIsRef, { once: true, margin: "-100px" });
  const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (user) {
      router.replace(dashboardRoute);
    }
  }, [user, dashboardRoute, router]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight;
        const scrollPosition = window.scrollY + 100; // Add offset for nav height
        setIsOnHero(scrollPosition < heroBottom);
      }
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <p className="text-secondary text-sm">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-paper">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isOnHero
          ? "bg-transparent backdrop-blur-sm border-b-1 border-white/10"
          : "bg-paper/95 backdrop-blur-md border-b-2 border-custom "
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-lg px-3 py-1.5 shadow-md transition-colors ${isOnHero ? "bg-primary" : "bg-primary"
                }`}
            >
              <span className="text-white font-bold text-lg">S</span>
            </motion.div>
            <span className={`font-bold text-xl transition-colors ${isOnHero ? "text-white" : "text-[var(--text)]"
              }`}>
              StrikeForce
            </span>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <Link
              href={isLoggedIn ? dashboardRoute : "/auth/login"}
              className={`text-sm font-semibold transition-colors ${isOnHero
                ? "text-white hover:text-primary"
                : "text-[var(--text)] hover:text-primary"
                }`}
            >
              {isLoggedIn ? "Dashboard" : "Log in"}
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/auth/signup")}
                className={`px-4 py-2 text-sm shadow-md transition-all rounded-full ${isOnHero
                  ? "bg-white hover:bg-very-pale text-[var(--text)]"
                  : "bg-primary hover:opacity-90 text-white"
                  }`}
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section with Background Image */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6 min-h-[100vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.pexels.com/photos/6146978/pexels-photo-6146978.jpeg"
            alt="Students collaborating"
            className="w-full h-full object-cover"
          />
          {/* Stronger Overlay for better contrast */}
          <div className="absolute inset-0 bg-[var(--text)]/60"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg"
          >
            Connect Universities, Students, and
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className=" drop-shadow-md"
            >
              {" "}Partners
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              for Real-World Impact
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium"
          >
            StrikeForce is a collaboration system that enables universities, students, and partners
            to run real-world projects efficiently — with traceable outcomes and verified participants.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/auth/signup/university")}
                className="bg-primary hover:opacity-90 text-white px-8 py-3 text-base font-semibold shadow-lg rounded-full"
              >
                Get Started as University
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/auth/signup/partner")}
                className="bg-white hover:bg-very-pale text-[var(--text)] border-2 border-white px-8 py-3 text-base font-semibold shadow-lg rounded-full"
              >
                Get Started as Partner
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What is StrikeForce */}
      <section ref={whatIsRef} className="py-20 px-6 bg-paper">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isWhatIsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[var(--text)] mb-4">What is StrikeForce?</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">
              A comprehensive platform that bridges the gap between academic learning and real-world application
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={isWhatIsInView ? "animate" : "initial"}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-2xl bg-pale cursor-pointer transition-shadow hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md"
              >
                <Target size={28} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-3">Project-Based Learning</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                Students work on real challenges from partner organizations, building practical skills and portfolios.
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-2xl bg-pale cursor-pointer transition-shadow hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md"
              >
                <Shield size={28} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-3">Verified Outcomes</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                Every project milestone is tracked, verified, and documented for transparent collaboration.
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-8 rounded-2xl bg-pale cursor-pointer transition-shadow hover:shadow-xl"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md"
              >
                <TrendingUp size={28} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-3">Escrow-Backed Payments</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                Secure payment system ensures students get paid and partners get quality deliverables.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Professional Design */}
      <section ref={benefitsRef} className="py-24 px-6 bg-paper">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-[var(--text)] mb-6">How StrikeForce Benefits You</h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Each party gains unique advantages from our collaborative platform
            </p>
          </motion.div>

          {/* Three Column Grid Layout */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate={isBenefitsInView ? "animate" : "initial"}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {/* Universities Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-pale rounded-3xl p-10 flex flex-col transition-shadow hover:shadow-2xl"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6"
              >
                <GraduationCap size={28} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-[var(--text)] mb-3">For Universities</h3>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Enhance your students' practical experience with real-world projects
              </p>
              <div className="space-y-4 mb-8 flex-grow">
                {[
                  { title: "Real-World Project Exposure", desc: "Connect students with industry challenges" },
                  { title: "Institutional Control", desc: "Manage projects and screen applications" },
                  { title: "Track Student Progress", desc: "Monitor completion in real-time" },
                  { title: "Partner Network", desc: "Access verified organizations" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBenefitsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 size={22} className="text-primary flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push("/auth/signup/university")}
                  className="bg-primary hover:opacity-90 text-white w-full py-3 text-base font-semibold rounded-full"
                >
                  Get Started as University
                </Button>
              </motion.div>
            </motion.div>

            {/* Partners Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-pale rounded-3xl p-10 flex flex-col transition-shadow hover:shadow-2xl"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6"
              >
                <Building2 size={28} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-[var(--text)] mb-3">For Partner Organizations</h3>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Execute projects with talented students and verified outcomes
              </p>
              <div className="space-y-4 mb-8 flex-grow">
                {[
                  { title: "Access Talented Students", desc: "Work with motivated students" },
                  { title: "Cost-Effective Solutions", desc: "Quality work at competitive rates" },
                  { title: "Milestone-Based Delivery", desc: "Track milestones via chat" },
                  { title: "Secure Escrow System", desc: "Fund projects securely" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBenefitsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 size={22} className="text-primary flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push("/auth/signup/partner")}
                  className="bg-primary hover:opacity-90 text-white w-full py-3 text-base font-semibold rounded-full"
                >
                  Get Started as Partner
                </Button>
              </motion.div>
            </motion.div>

            {/* Students Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-pale rounded-3xl p-10 flex flex-col transition-shadow hover:shadow-2xl"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6"
              >
                <Users size={28} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-[var(--text)] mb-3">For Students</h3>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Build your portfolio and earn while learning with real projects
              </p>
              <div className="space-y-4 mb-8 flex-grow">
                {[
                  { title: "Real-World Experience", desc: "Work on actual projects" },
                  { title: "Earn While Learning", desc: "Get paid through escrow" },
                  { title: "Build Your Portfolio", desc: "Showcase verified outcomes" },
                  { title: "Professional Network", desc: "Connect with partners" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBenefitsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 size={22} className="text-primary flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-[var(--text)] mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isBenefitsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-4 text-center"
              >
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Students join through their university
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Image */}
      <section ref={ctaRef} className="relative py-20 px-6 min-h-[60vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={isCtaInView ? { scale: 1 } : { scale: 1.1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.pexels.com/photos/7974/pexels-photo.jpg"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-[var(--text)]/70"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold mb-4 drop-shadow-lg"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white mb-8 drop-shadow-md font-medium"
          >
            Join StrikeForce and start collaborating today
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/auth/signup/university")}
                className="bg-white hover:bg-very-pale text-[var(--text)] px-8 py-3 text-base font-semibold shadow-lg rounded-full"
              >
                Get Started as University
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/auth/signup/partner")}
                className=" hover:bg-white/30 text-white border border-white/50 px-8 py-3 text-base font-semibold  shadow-lg rounded-full"
              >
                Get Started as Partner
              </Button>
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isCtaInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-sm text-white font-medium"
          >
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:underline font-bold">
              Log in
            </Link>
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 px-6 bg-pale border-t-2 border-custom"
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-2 font-medium">
            Powered by <span className="font-bold text-[var(--text)]">BVR Innovation Group</span>
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} StrikeForce. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
