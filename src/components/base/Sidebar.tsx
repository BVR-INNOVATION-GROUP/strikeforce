"use client"

import IconButton from "../core/IconButton";
import { SidebarLinkI } from "./SidebarLink";
import { LayoutPanelTop, Briefcase, Wallet, User, Settings, File, MessageCircle } from "lucide-react";
import { motion } from "framer-motion"
import { Activity, useState } from "react";
import Link from "next/link";

type Role = "partner" | "student" | "univerity-admin" | "super-admin";

export interface SideLinkCategory {
    role: Role;
    links: SidebarLinkI[];
}



const Sidebar = () => {

    const userRole: Role = "partner"

    const [selectedTitle, setSelectedTitle] = useState("")

    const links: SideLinkCategory[] = [
        {
            role: "partner",
            links: [
                {
                    title: "Dashboard",
                    icon: <LayoutPanelTop />,
                    path: "/partner",
                },
                {
                    title: "Projects",
                    icon: <Briefcase />,
                    isFocused: true,
                    path: "/partner/projects"
                },
                {
                    title: "Wallet",
                    icon: <Wallet />,
                    path: "/partner/wallet"
                },
                {
                    title: "Chat",
                    icon: <MessageCircle />,
                    path: "/partner/chat"
                },
                {
                    title: "Contracts",
                    icon: <File />,
                    path: "/partner/contracts"
                },
                {
                    title: "Profile",
                    icon: <User />,
                    path: "/partner/profile"
                },
                {
                    title: "Settings",
                    icon: <Settings />,
                    path: "/settings"
                },
            ]
        }
    ]

    const getLinks = (): SidebarLinkI[] => {
        return links.find(l => l.role == userRole)?.links ?? []
    }

    return (
        <div className="bg-paper z-[10] w-[6vw] flex flex-col items-center gap-3 p-[2vw]">
            {
                getLinks()?.map((l, i) => <Link key={i} href={l.path}><motion.div onHoverStart={() => setSelectedTitle(l.title)} onHoverEnd={() => setSelectedTitle("")} className="relative ">
                    <IconButton icon={l.icon} className={`hover-bg-pale ${l.isFocused && "text-primary bg-pale"}`} />
                    {/* <Activity mode={selectedTitle == l.title ? "visible" : "hidden"}> */}
                    {
                        selectedTitle == l.title
                        &&
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-[110%] bg-paper px-6 py-3 shadow-custom rounded-lg transform -translate-y-[50%] top-[50%]">
                            {l.title}
                        </motion.div>
                    }
                    {/* </Activity> */}
                </motion.div></Link>)
            }
        </div>
    )
}

export default Sidebar