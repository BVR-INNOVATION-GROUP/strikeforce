"use client";

import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import IconButton from '../core/IconButton'
import Popover from './Popover'
import { Bell, Settings, User, LogOut, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuthStore } from '@/src/store'
import { useRouter } from 'next/navigation'
import { UserI } from '@/src/models/user'
import { notificationService } from '@/src/services/notificationService'
import { NotificationI } from '@/src/models/notification'

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
 * Get user avatar URL with fallback
 */
const getUserAvatar = (user: UserI | null): string => {
    if (user?.profile?.avatar) {
        return user.profile.avatar
    }
    // Fallback: Generate a simple avatar based on user's initials
    // In production, you might use a service like UI Avatars or generate a colored circle
    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U'
    // Using a placeholder service for fallback avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=e9226e&color=fff&size=128`
}

const Navbar = () => {
    const { user, setUser, logout } = useAuthStore()
    const router = useRouter()
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loadingNotifications, setLoadingNotifications] = useState(false)

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
                const userNotifications = await notificationService.getUserNotifications(user.id)
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
        <div className="fixed top-0 left-0 right-0 h-[8vh] bg-paper flex items-center z-[1] border-b border-custom">
            <div className="w-full px-4 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4 justify-end">
                    {/* Notifications Popover */}
                    <Popover
                        open={notificationsOpen}
                        onOpenChange={setNotificationsOpen}
                        placement="bottom-end"
                        className="w-[320px] max-h-[400px] overflow-y-auto"
                        content={
                            <div className="p-2">
                                <div className="px-3 py-2 border-b border-custom flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="py-2">
                                    {loadingNotifications ? (
                                        <div className="px-3 py-8 text-center text-sm opacity-60">
                                            Loading notifications...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-3 py-8 text-center text-sm opacity-60">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`px-3 py-3 hover:bg-pale cursor-pointer border-b border-custom last:border-b-0 ${!notification.read ? 'bg-pale-primary' : ''
                                                    }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium mb-1">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs opacity-60 overflow-hidden" style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs opacity-40 mt-1">
                                                            {formatTimeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
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
                            <img
                                src={getUserAvatar(user)}
                                className="h-11 w-11 rounded-full object-cover border-2 border-custom hover:border-primary transition-colors"
                                alt={user?.name || 'User avatar'}
                                onError={(e) => {
                                    // Fallback to initials avatar if image fails to load
                                    const target = e.target as HTMLImageElement
                                    const initials = user?.name
                                        ? user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)
                                        : 'U'
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=e9226e&color=fff&size=128`
                                }}
                            />
                        </div>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export default Navbar