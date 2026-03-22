"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Logo from "./Logo";
import IconButton from "../core/IconButton";
import Popover from "./Popover";
import Avatar from "@/src/components/core/Avatar";
import { Bell, Settings, User, LogOut, CheckCircle, AlertCircle, Info, Menu, Sun, Moon, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/src/store";
import { useUIStore } from "@/src/store/useUIStore";
import { useThemeStore } from "@/src/store/useThemeStore";
import { useRouter } from "next/navigation";
import { UserI } from "@/src/models/user";
import { notificationService } from "@/src/services/notificationService";
import { NotificationI } from "@/src/models/notification";
import { BASE_URL } from "@/src/api/client";
import DirectMessagesInboxPanel from "@/src/components/base/DirectMessagesInboxPanel";
import { directMessageService, DirectMessageThread } from "@/src/services/directMessageService";
import { countUnreadThreads } from "@/src/utils/directMessageReadState";

const DM_INBOX_ROLES = new Set(["super-admin", "partner", "university-admin"]);

/**
 * Get notification icon based on type
 */
const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'success':
            return <CheckCircle size={16} className="text-green-500" />
        case 'alert':
            return <AlertCircle size={16} className="text-yellow-500" />
        case 'error':
            return <AlertCircle size={16} className="text-red-500" />
        default:
            return <Info size={16} className="text-blue-500" />
    }
}

/**
 * Format time ago from ISO date string
 */
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return 'Just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
}

/**
 * Get user avatar src (relative or absolute) if available
 */
const getUserAvatarSrc = (user: UserI | null): string => {
    if (user?.profile?.avatar) {
        const avatar = user.profile.avatar;
        return avatar.startsWith("http") ? avatar : `${BASE_URL}/${avatar}`;
    }
    return "";
};

const Navbar = () => {
    const { user, setUser, logout, organization } = useAuthStore();
    const { openDrawer } = useUIStore();
    const router = useRouter();
    const { theme, toggleTheme } = useThemeStore();
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loadingNotifications, setLoadingNotifications] = useState(false)
    const [dmPanelOpen, setDmPanelOpen] = useState(false)
    const [dmThreads, setDmThreads] = useState<DirectMessageThread[]>([])
    const [dmThreadsLoading, setDmThreadsLoading] = useState(false)
    const [dmReadEpoch, setDmReadEpoch] = useState(0)

    const showDmInbox = !!(user && DM_INBOX_ROLES.has(user.role))

    const bumpDmRead = useCallback(() => {
        setDmReadEpoch((e) => e + 1)
    }, [])

    const reloadDmThreads = useCallback(async (opts?: { silent?: boolean }) => {
        if (!showDmInbox || user?.id == null) return
        const silent = opts?.silent ?? false
        if (!silent) setDmThreadsLoading(true)
        try {
            const list = await directMessageService.listThreads()
            setDmThreads(Array.isArray(list) ? list : [])
        } catch {
            setDmThreads([])
        } finally {
            if (!silent) setDmThreadsLoading(false)
        }
    }, [showDmInbox, user?.id])

    useEffect(() => {
        if (!showDmInbox || user?.id == null) return
        void reloadDmThreads({ silent: false })
        const t = window.setInterval(() => void reloadDmThreads({ silent: true }), 30000)
        return () => window.clearInterval(t)
    }, [showDmInbox, user?.id, reloadDmThreads])

    const dmUnreadCount = useMemo(() => {
        if (user?.id == null) return 0
        const uid = typeof user.id === "number" ? user.id : Number(user.id)
        if (Number.isNaN(uid)) return 0
        return countUnreadThreads(dmThreads, uid)
    }, [dmThreads, user?.id, dmReadEpoch])

    /**
     * Fetch notifications for the current user
     */
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id) {
                setNotifications([])
                setUnreadCount(0)
                return
            }

            setLoadingNotifications(true)
            try {
                const userNotifications = await notificationService.getUserNotifications()
                setNotifications(userNotifications)

                // Calculate unread count
                const unread = userNotifications.filter((n) => !n.read).length
                setUnreadCount(unread)
            } catch (error) {
                console.error('Failed to fetch notifications:', error)
                setNotifications([])
                setUnreadCount(0)
            } finally {
                setLoadingNotifications(false)
            }
        }

        fetchNotifications()
    }, [user?.id])

    /**
     * Mark notification as read when clicked
     */
    const handleNotificationClick = async (notification: NotificationI) => {
        if (!notification.read) {
            try {
                await notificationService.markAsRead(notification.id)
                // Update local state
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n
                    )
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            } catch (error) {
                console.error('Failed to mark notification as read:', error)
            }
        }

        // Navigate to link if provided
        if (notification.link) {
            router.push(notification.link)
        }
        setNotificationsOpen(false)
    }

    /**
     * Get user profile route based on role
     */
    const getProfileRoute = () => {
        if (!user) return '/partner/profile'
        if (user.role === 'delegated-admin') {
            return organization?.type === 'PARTNER'
                ? '/partner/profile'
                : '/university-admin/profile'
        }
        const roleRoutes: Record<string, string> = {
            partner: '/partner/profile',
            student: '/student/profile',
            supervisor: '/supervisor/profile',
            'university-admin': '/university-admin/profile',
            'super-admin': '/super-admin/profile',
        }
        return roleRoutes[user.role] || '/partner/profile'
    }

    /**
     * Get settings route based on role
     */
    const getSettingsRoute = () => {
        if (!user) return '/partner/settings'
        if (user.role === 'delegated-admin') {
            return organization?.type === 'PARTNER'
                ? '/partner/settings'
                : '/university-admin/settings'
        }
        const roleRoutes: Record<string, string> = {
            partner: '/partner/settings',
            student: '/student/settings',
            supervisor: '/supervisor/settings',
            'university-admin': '/university-admin/settings',
            'super-admin': '/super-admin/settings',
        }
        return roleRoutes[user.role] || '/partner/settings'
    }

    /**
     * Handle logout
     */
    const handleLogout = () => {
        logout()
        // Force full page reload to ensure middleware sees cleared cookies
        // Wait longer to ensure all cleanup (localStorage, cookies, etc.) completes
        // The logout flag will be cleared by onRehydrateStorage after preventing rehydration
        setTimeout(() => {
            window.location.href = '/'
        }, 200)
    }

    /**
     * Truncate long names
     */
    const truncateName = (name: string, maxLength: number = 20) => {
        if (name.length <= maxLength) return name
        return name.substring(0, maxLength - 3) + '...'
    }

    return (
        <div className="fixed top-0 left-0 right-0 h-[8vh] min-h-[48px] bg-paper flex items-center z-[1] border-b border-custom">
            <div className="w-full px-4 flex items-center justify-between">
                {/* Show organization logo if available, otherwise show default logo */}
                <div className="flex items-center gap-2">
                    {/* Hamburger - visible only on small screens when sidebar is replaced by drawer */}
                    <button
                        onClick={openDrawer}
                        className="md:hidden p-2 rounded-lg hover:bg-pale transition-colors -ml-1"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    {organization?.logo ? (
                        <div className="flex ml-[1vw] items-center justify-center">
                            <img
                                src={
                                    organization.logo.startsWith("http")
                                        ? organization.logo
                                        : `${BASE_URL}/${organization.logo}`
                                }
                                alt={organization.name || "Organization Logo"}
                                className="h-12 w-auto rounded-lg object-contain max-w-[200px]"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                }}
                            />
                        </div>
                    ) : (
                        <Logo />
                    )}
                </div>
                <div className="flex items-center gap-4 justify-end">
                    {/* Theme toggle */}
                    <IconButton
                        onClick={toggleTheme}
                        icon={
                            theme === "dark" ? (
                                <Sun size={18} className="text-secondary" />
                            ) : (
                                <Moon size={18} className="text-secondary" />
                            )
                        }
                    />

                    {showDmInbox && user?.id != null && (
                        <div className="relative z-10 shrink-0 overflow-visible">
                            <IconButton
                                onClick={() => {
                                    setDmPanelOpen(true)
                                    void reloadDmThreads({ silent: dmThreads.length > 0 })
                                }}
                                icon={<MessageCircle size={20} className="text-secondary" />}
                            />
                            {dmUnreadCount > 0 ? (
                                <span
                                    className="pointer-events-none absolute -right-1 -top-1 z-20 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white shadow-sm ring-2 ring-paper"
                                    aria-label={`${dmUnreadCount} unread conversations`}
                                >
                                    {dmUnreadCount > 99 ? "99+" : dmUnreadCount}
                                </span>
                            ) : null}
                        </div>
                    )}

                    {/* Notifications Popover */}
                    <Popover
                        open={notificationsOpen}
                        onOpenChange={setNotificationsOpen}
                        placement="bottom-end"
                        className="w-[340px] max-h-[420px] overflow-y-auto"
                        content={
                            <div className="p-3 bg-paper bg-red-400 rounded-xl shadow-custom ">
                                <div className="px-3 py-2 border-b border-custom flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-primary">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="py-2 max-h-[360px] overflow-y-auto space-y-1">
                                    {loadingNotifications ? (
                                        <div className="px-3 py-8 text-center text-sm text-secondary">
                                            Loading notifications...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-3 py-8 text-center text-sm text-secondary">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((notification) => {
                                            const getCategoryLabel = (title: string, message: string): string => {
                                                const lowerTitle = title.toLowerCase();
                                                const lowerMessage = message.toLowerCase();
                                                if (lowerTitle.includes('partner') || lowerMessage.includes('partner added')) {
                                                    return 'New Partner Added';
                                                }
                                                if (lowerTitle.includes('project') && (lowerTitle.includes('posted') || lowerTitle.includes('new'))) {
                                                    return 'New Project Posted';
                                                }
                                                if (lowerTitle.includes('application') || lowerMessage.includes('application received')) {
                                                    return 'Student Application Received';
                                                }
                                                if (lowerTitle.includes('approved') || lowerTitle.includes('approval')) {
                                                    return 'Project Approved';
                                                }
                                                return 'System Notification';
                                            };

                                            const category = getCategoryLabel(notification.title, notification.message);
                                            const isUnread = !notification.read;

                                            return (
                                                <button
                                                    key={notification.id}
                                                    type="button"
                                                    className={`w-full text-left px-3 py-3 rounded-lg border border-transparent transition-colors flex gap-3 ${isUnread
                                                        ? 'bg-primary/5 border-primary/10'
                                                        : 'hover:bg-pale'
                                                        }`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[0.65rem] font-semibold text-muted mb-1 uppercase tracking-wide">
                                                            {category}
                                                        </p>
                                                        <p className="text-sm font-medium text-primary mb-1 line-clamp-1">
                                                            {notification.title}
                                                        </p>
                                                        <p
                                                            className="text-xs text-secondary line-clamp-2"
                                                        >
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[0.65rem] text-muted mt-1">
                                                            {formatTimeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                    {isUnread && (
                                                        <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        }
                    >
                        <div>
                            <IconButton icon={<Bell />} indicator={unreadCount > 0} />
                        </div>
                    </Popover>

                    {/* User Menu Popover */}
                    <Popover
                        open={userMenuOpen}
                        onOpenChange={setUserMenuOpen}
                        placement="bottom-end"
                        className="w-[200px]"
                        content={
                            <div className="p-2">
                                {/* User Info */}
                                {user && (
                                    <div className="px-3 py-3 border-b border-custom">
                                        <p
                                            className="text-sm font-medium truncate"
                                            title={user.name}
                                        >
                                            {truncateName(user.name)}
                                        </p>
                                        <p className="text-xs opacity-60 truncate mt-1">
                                            {user.email}
                                        </p>
                                    </div>
                                )}

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            router.push(getProfileRoute())
                                            setUserMenuOpen(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-pale flex items-center gap-2 rounded"
                                    >
                                        <User size={16} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.push(getSettingsRoute())
                                            setUserMenuOpen(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-pale flex items-center gap-2 rounded"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <div className="border-t border-custom my-1" />
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setUserMenuOpen(false)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-pale flex items-center gap-2 rounded text-red-600"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        }
                    >
                        <div className="cursor-pointer">
                            <Avatar
                                src={getUserAvatarSrc(user)}
                                name={user?.name}
                                className="h-11 w-11"
                            />
                        </div>
                    </Popover>
                </div>
            </div>
            {showDmInbox && user?.id != null && (
                <DirectMessagesInboxPanel
                    open={dmPanelOpen}
                    onClose={() => setDmPanelOpen(false)}
                    threads={dmThreads}
                    threadsLoading={dmThreadsLoading}
                    onReloadThreads={reloadDmThreads}
                    currentUserId={typeof user.id === "number" ? user.id : Number(user.id)}
                    onThreadRead={bumpDmRead}
                />
            )}
        </div>
    )
}

export default Navbar