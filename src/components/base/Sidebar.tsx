"use client"

import IconButton from "../core/IconButton";
import { motion } from "framer-motion"
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/src/store";
import { usePathname } from "next/navigation";
import { useSidebarLinks } from "@/src/hooks/useSidebarLinks";
import React from "react";

type Role = "partner" | "student" | "supervisor" | "university-admin" | "delegated-admin" | "super-admin";

const Sidebar = () => {
    // Get user role from auth store (in production, from NextAuth session)
    const { user } = useAuthStore();
    const pathname = usePathname();
    const userRole: Role = user?.role || "partner";
    const [selectedTitle, setSelectedTitle] = useState("")

    // Get filtered links based on user role
    const links = useSidebarLinks(userRole);

    return (
        <div className="hidden md:flex fixed top-[8vh] left-0 bottom-0 bg-paper z-[1] w-[6vw] flex-col items-center gap-3 p-[2vw]">
            {
                links?.map((l, i) => {
                    // Check for exact match first
                    const exactMatch = pathname === l.path;

                    // For prefix matching: check if current pathname starts with this link's path
                    // This handles nested routes like /university-admin/departments/[id]/courses
                    // Exclude dashboard routes from prefix matching (only exact match for dashboard)
                    const isDashboardRoute = l.path === `/${userRole}` || l.path === `/${userRole}/`;
                    const prefixMatch = !isDashboardRoute && pathname && pathname.startsWith(l.path + "/");

                    const isActive = exactMatch || prefixMatch;
                    const IconComponent = l.iconComponent;
                    return (
                        <Link key={i} href={l.path}>
                            <motion.div
                                onHoverStart={() => setSelectedTitle(l.title)}
                                onHoverEnd={() => setSelectedTitle("")}
                                className="relative"
                            >
                                <IconButton
                                    icon={<IconComponent size={23} />}
                                    className={`hover-bg-pale ${(isActive || l.isFocused) && "text-primary bg-pale"}`}
                                />
                                {
                                    selectedTitle === l.title
                                    &&
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute left-[110%] min-w-max w-max bg-paper px-6 py-3 shadow-custom-lg rounded-lg transform -translate-y-[50%] top-[50%] border border-custom"
                                    >
                                        {l.title}
                                    </motion.div>
                                }
                            </motion.div>
                        </Link>
                    );
                })
            }
        </div>
    )
}

export default Sidebar
