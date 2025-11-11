"use client"

import IconButton from "../core/IconButton";
import { motion } from "framer-motion"
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/src/store";
import { usePathname } from "next/navigation";
import { useSidebarLinks } from "@/src/hooks/useSidebarLinks";
import React from "react";

type Role = "partner" | "student" | "supervisor" | "university-admin" | "super-admin";

const Sidebar = () => {
    // Get user role from auth store (in production, from NextAuth session)
    const { user } = useAuthStore();
    const pathname = usePathname();
    const userRole: Role = user?.role || "partner";
    const [selectedTitle, setSelectedTitle] = useState("")

    // Get filtered links based on user role
    const links = useSidebarLinks(userRole);

    return (
        <div className="fixed top-[8vh] left-0 bottom-0 bg-paper z-[1] w-[6vw] flex flex-col items-center gap-3 p-[2vw]">
            {
                links?.map((l, i) => {
                    // Check for exact match first
                    const exactMatch = pathname === l.path;

                    // Only use prefix matching if:
                    // 1. No exact match exists for current pathname
                    // 2. This link is a dashboard route (matches role base path exactly)
                    // 3. Current pathname starts with this link's path
                    const isDashboardRoute = l.path === `/${userRole}`;
                    const hasExactMatch = links.some(link => pathname === link.path);
                    const prefixMatch = !hasExactMatch && isDashboardRoute && pathname?.startsWith(l.path + "/");

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
                                        className="absolute left-[110%] min-w-max w-max bg-white px-6 py-3 shadow-custom-lg rounded-lg transform -translate-y-[50%] top-[50%]"
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
