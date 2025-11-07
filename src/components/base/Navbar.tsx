"use client";

import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import IconButton from '../core/IconButton'
import Popover from './Popover'
import { Bell, Settings, User, LogOut, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuthStore } from '@/src/store'
import { useRouter } from 'next/navigation'
import { UserI } from '@/src/models/user'

/**
 * Dummy notification data
 */
const dummyNotifications = [
    {
        id: '1',
        type: 'success',
        title: 'Project Approved',
        message: 'Your project "E-Commerce Platform" has been approved',
        time: '2 hours ago',
        read: false,
    },
    {
        id: '2',
        type: 'info',
        title: 'New Application',
        message: 'A new group applied to your project',
        time: '5 hours ago',
        read: false,
    },
    {
        id: '3',
        type: 'alert',
        title: 'Milestone Due Soon',
        message: 'Milestone "Design Phase" is due in 2 days',
        time: '1 day ago',
        read: true,
    },
    {
        id: '4',
        type: 'success',
        title: 'Payment Released',
        message: 'Payment for milestone "Development Phase" has been released',
        time: '2 days ago',
        read: true,
    },
]

/**
 * Get notification icon based on type
 */
const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'success':
            return <CheckCircle size={16} className="text-green-500" />
        case 'alert':
            return <AlertCircle size={16} className="text-yellow-500" />
        default:
            return <Info size={16} className="text-blue-500" />
    }
}

const Navbar = () => {
    const { user, setUser, logout } = useAuthStore()
    const router = useRouter()
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // Note: Removed auto-initialization - users should log in through proper login flow
    // Auto-initialization was causing issues where logged-in users were being overridden on refresh

    // Calculate unread notifications count
    useEffect(() => {
        const unread = dummyNotifications.filter((n) => !n.read).length
        setUnreadCount(unread)
    }, [])

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
                                    {dummyNotifications.length === 0 ? (
                                        <div className="px-3 py-8 text-center text-sm opacity-60">
                                            No notifications
                                        </div>
                                    ) : (
                                        dummyNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`px-3 py-3 hover:bg-pale cursor-pointer border-b border-custom last:border-b-0 ${
                                                    !notification.read ? 'bg-pale-primary' : ''
                                                }`}
                                                onClick={() => {
                                                    // Mark as read logic would go here
                                                    setNotificationsOpen(false)
                                                }}
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
                                                            {notification.time}
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
                                src="https://images.pexels.com/photos/2743754/pexels-photo-2743754.jpeg"
                                className="h-11 w-11 rounded-full object-cover border-2 border-custom hover:border-primary transition-colors"
                                alt={user?.name || 'User avatar'}
                            />
                        </div>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export default Navbar