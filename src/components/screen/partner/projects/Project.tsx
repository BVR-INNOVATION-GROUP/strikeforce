"use client"
import { Clock } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { ProjectI as ModelProjectI, ProjectStatus } from '@/src/models/project'
import { ApplicationI } from '@/src/models/application'
import { currenciesArray } from '@/src/constants/currencies'
import { formatDateShort } from '@/src/utils/dateFormatters'
import { transformApplications } from '@/src/utils/projectTransformers'
import { getInitials, hasAvatar } from '@/src/utils/avatarUtils'

export interface UserI {
    avatar: string
    name: string
}

export interface GroupI {
    name: string
    members: UserI[]
}

export type projectStatus = "in-progress" | "on-hold" | "completed"

/**
 * UI Project interface for card display
 * Uses model data but formats for UI display
 */
export interface ProjectI {
    id: number | string
    title: string
    description: string
    skills: string[]
    status: projectStatus
    group: GroupI
    expiryDate: string
    cost: string
    onMove?: (projectId: number | string, currentProjectStatus: projectStatus, x: number) => void
}

/**
 * Props interface that accepts model data
 */
export interface ProjectCardProps {
    project: ModelProjectI
    applications?: ApplicationI[]
    onMove?: (projectId: number | string, currentProjectStatus: projectStatus, x: number) => void
}

/**
 * Convert model project to UI display format
 * Syncs with the same data transformation used in detail page
 */
const convertProjectToDisplay = async (
    project: ModelProjectI,
    applications?: ApplicationI[]
): Promise<ProjectI> => {
    // Format currency
    const currencyInfo = currenciesArray.find((c) => c.code === project.currency)
    const currencySymbol = currencyInfo?.symbol || project.currency
    const formattedCost = `${currencySymbol}${project.budget.toLocaleString()}`

    // Format deadline date (same format as detail page)
    const formattedDeadline = formatDateShort(project.deadline)

    // Get assigned group from applications (same logic as detail page)
    let group: GroupI = {
        name: "Not Assigned",
        members: []
    }

    if (applications && applications.length > 0) {
        // Load groups and users data (same as detail page transformation)
        const [groupsModule, usersModule] = await Promise.all([
            import("@/src/data/mockGroups.json"),
            import("@/src/data/mockUsers.json")
        ])
        const groupsData = groupsModule.default
        const usersData = usersModule.default

        // Transform applications (same as detail page)
        const transformedApps = transformApplications(applications, groupsData, usersData)

        // Find assigned application
        const assignedApp = transformedApps.find(app => app.status === "ASSIGNED" || app.rawStatus === "ASSIGNED")

        if (assignedApp) {
            group = {
                name: assignedApp.groupName,
                members: assignedApp.members
            }
        }
    }

    // Map status to card status format
    const cardStatus: projectStatus =
        project.status === "in-progress" || project.status === "published" ? "in-progress" :
            project.status === "on-hold" ? "on-hold" :
                project.status === "completed" ? "completed" : "in-progress"

    return {
        id: typeof project.id === 'string' ? parseInt(project.id, 10) : project.id,
        title: project.title,
        description: project.description,
        skills: project.skills,
        status: cardStatus,
        group,
        expiryDate: formattedDeadline,
        cost: formattedCost
    }
}

/**
 * Project Card Component
 * Accepts model data and transforms it for display
 * Syncs information flow with detail page
 * Enhanced with Trello-like drag and drop
 */
const Project = (props: ProjectCardProps | ProjectI & { index?: number }) => {
    const router = useRouter()
    const moveRef = useRef(false)
    const dragDistanceRef = useRef(0)
    const startXRef = useRef(0)
    const [displayProject, setDisplayProject] = React.useState<ProjectI | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

    // Convert props to display format if needed
    React.useEffect(() => {
        const loadProject = async () => {
            // Check if props is already in UI format (ProjectI)
            if ('group' in props && 'cost' in props && 'expiryDate' in props) {
                const uiProject = props as ProjectI
                // Preserve onMove if it exists in props
                setDisplayProject(uiProject)
            } else if ('project' in props) {
                // Convert from model format
                const cardProps = props as ProjectCardProps
                const converted = await convertProjectToDisplay(
                    cardProps.project,
                    cardProps.applications
                )
                // Add onMove from props if provided
                if (cardProps.onMove) {
                    converted.onMove = cardProps.onMove
                }
                setDisplayProject(converted)
            }
        }
        loadProject()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Only depend on specific props to avoid infinite loops
        'project' in props ? (props as ProjectCardProps).project?.id : (props as ProjectI).id,
        'project' in props ? (props as ProjectCardProps).applications?.length : undefined
    ])

    if (!displayProject) {
        return null // Or a loading state
    }

    const p = displayProject

    /**
     * Handle drag start - track initial position and set dragging state
     */
    const handleDragStart = (_event: MouseEvent | TouchEvent | PointerEvent, info?: { point?: { x: number; y: number } }) => {
        startXRef.current = info?.point?.x || 0
        dragDistanceRef.current = 0
        setIsDragging(true)
    }

    /**
     * Handle drag movement - trigger onMove callback if needed
     */
    const handleDrag = (x: number, info?: { point?: { x: number; y: number } }) => {
        // Calculate total drag distance to determine if it was a drag or click
        if (info?.point?.x !== undefined && startXRef.current !== undefined) {
            dragDistanceRef.current = Math.abs(info.point.x - startXRef.current)
        }

        // Get onMove from displayProject or props
        const onMove = p.onMove || ('onMove' in props && typeof props.onMove === 'function' ? props.onMove : undefined)
        if (!moveRef.current && onMove) {
            moveRef.current = true
            onMove(p.id, p.status, x)
        }
    }

    /**
     * Handle drag end - reset flags and dragging state
     */
    const handleDragEnd = () => {
        moveRef.current = false
        setIsDragging(false)
        // Reset drag distance after a short delay to allow click handler to check it
        setTimeout(() => {
            dragDistanceRef.current = 0
        }, 50)
    }

    /**
     * Handle card click - navigate to project details if not dragging
     * Only navigate if drag distance was minimal (less than 5px, indicating a click)
     */
    const handleCardClick = () => {
        // Only navigate if the drag distance was minimal (indicating a click, not a drag)
        if (dragDistanceRef.current < 5) {
            // Determine route based on whether onMove is provided (partner vs student)
            const basePath = p.onMove !== undefined ? "/partner" : "/student";
            router.push(`${basePath}/projects/${p.id}`)
        }
    }

    /**
     * Handle image load error - track failed images to show fallback
     * Uses memberKey to uniquely identify each member's image
     */
    const handleImageError = (memberKey: string) => {
        setFailedImages((prev) => new Set(prev).add(memberKey))
    }

    /**
     * Render avatar with fallback to initials
     * Benchmarked from GroupCard component for consistency
     */
    const renderAvatar = (member: UserI, index: number) => {
        const avatarUrl = member?.avatar
        const memberKey = `${member?.name}-${index}`
        const hasImage = hasAvatar(avatarUrl) && !failedImages.has(memberKey)
        const initials = getInitials(member?.name)

        return (
            <motion.div
                key={memberKey}
                className={`relative ${index > 0 ? "-ml-3" : ""}`}
                style={{
                    zIndex: (p?.group?.members?.length || 0) - index,
                }}
                whileHover={{ scale: 1.1, zIndex: 100 }}
                transition={{ type: "spring", stiffness: 400 }}
                title={member?.name}
            >
                {hasImage ? (
                    <img
                        src={avatarUrl}
                        alt={member?.name || "Team member"}
                        className="h-12 w-12 border-2 border-pale rounded-full object-cover"
                        onError={() => handleImageError(memberKey)}
                    />
                ) : (
                    <div className="h-12 w-12 border-2 border-pale rounded-full flex items-center justify-center bg-pale-primary">
                        <span className="text-primary font-semibold text-sm">
                            {initials}
                        </span>
                    </div>
                )}
            </motion.div>
        )
    }

    // Determine drag constraints based on status (Trello-like: can drag left/right between columns)
    // In-progress cards can drag right (positive x) to move to on-hold
    // On-hold cards can drag left (negative x) to move back to in-progress
    // Disable dragging if onMove is not provided (for student view)
    const canDrag = p.status !== "completed" && p.onMove !== undefined
    const dragConstraints = canDrag ? {
        left: p.status === "on-hold" ? -200 : 0,
        right: p.status === "in-progress" ? 200 : 0,
        top: 0,
        bottom: 0
    } : undefined

    return (
        <motion.div
            drag={canDrag}
            dragSnapToOrigin={true}
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragMomentum={false}
            whileDrag={{
                scale: 1.05,
                rotate: 2,
                zIndex: 1000,
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: isDragging ? 0.9 : 1,
                y: 0,
                scale: isDragging ? 1.05 : 1
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={(_, info) => handleDrag(info?.point?.x || 0, info)}
            onClick={handleCardClick}
            className={`rounded-lg p-8 bg-paper border border-custom shadow-custom hover:shadow-lg cursor-pointer transition-all duration-200 ${isDragging ? 'ring-2 ring-primary ring-opacity-50' : ''
                } ${!canDrag ? 'opacity-90' : ''}`}
        >
            <h3 className="text-[1rem] font-[600] hover:text-primary transition-colors">{p.title}</h3>
            <p className='my-3 mb-6 opacity-60 line-clamp-2'>{p.description}</p>
            <div className="flex flex-wrap gap-3 items-center">
                {
                    p?.skills?.map((s, i) => (
                        <motion.div
                            key={i}
                            className='rounded-full bg-very-pale px-4 py-2 text-xs'
                            whileHover={{ scale: 1.05 }}
                        >
                            {s}
                        </motion.div>
                    ))
                }
            </div>
            {/* Group members with improved avatar handling */}
            {p?.group?.members && p.group.members.length > 0 && (
                <div className="my-3 flex items-center gap-2">
                    <div className="flex items-center">
                        {p.group.members.map((member, index) => renderAvatar(member, index))}
                    </div>
                    {p.group.name && p.group.name !== "Not Assigned" && (
                        <span className="text-[0.8125rem] opacity-60 ml-2">
                            {p.group.name}
                        </span>
                    )}
                </div>
            )}

            <div className="flex mt-8 items-center justify-between">
                <p className='underline font-semibold'>{p?.cost}</p>
                <p className='font-[500] opacity-50 flex items-center gap-2'>
                    <Clock size={14} /> {p?.expiryDate}
                </p>
            </div>
        </motion.div>
    )
}

export default Project