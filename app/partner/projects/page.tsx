"use client"
import Button from '@/src/components/core/Button'
import IconButton from '@/src/components/core/IconButton'
import Board from '@/src/components/screen/partner/projects/Board'
import Project, { ProjectI, projectStatus } from '@/src/components/screen/partner/projects/Project'
import ProjectForm from '@/src/components/screen/partner/projects/ProjectForm'
import ProjectsListSkeleton from '@/src/components/screen/partner/projects/ProjectsListSkeleton'
import { ProjectI as ModelProjectI, ProjectStatus } from '@/src/models/project'
import React, { useEffect, useState } from 'react'
import { convertModelToUIProject } from '@/src/utils/projectConversion'
import { projectService } from '@/src/services/projectService'
import { useAuthStore as UseAuthStore } from '@/src/store'
import { useToast as UseToast } from '@/src/hooks/useToast'

const page = () => {
    const { user } = UseAuthStore()
    const { showSuccess, showError } = UseToast()
    const [projects, setProjects] = useState<ProjectI[]>([])
    const [modelProjects, setModelProjects] = useState<ModelProjectI[]>([]) // Store original model projects for status filtering
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    /**
     * Load projects for the current partner
     */
    useEffect(() => {
        const loadProjects = async () => {
            if (!user?.id) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                // Fetch projects filtered by partnerId (efficient database query)
                const partnerId = typeof user.id === 'string' ? Number(user.id) : user.id
                const result = await projectService.getAllProjects({
                    partnerId: partnerId
                })

                // Store model projects for status filtering
                setModelProjects(result.projects)
                // Convert model projects to UI format
                const uiProjects = result.projects.map((p) => convertModelToUIProject(p))
                setProjects(uiProjects)
            } catch (error) {
                console.error("Failed to load projects:", error)
                showError("Failed to load projects. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        loadProjects()
    }, [user?.id])

    /**
     * Handle new project submission from form
     * Creates the project via service and refreshes the list
     */
    const handleProjectSubmit = async (newProject: Omit<ModelProjectI, 'id' | 'createdAt' | 'updatedAt' | 'partnerId'>) => {
        if (!user?.id) {
            showError("User not found. Please log in again.")
            throw new Error("User not found. Please log in again.")
        }

        // Add partnerId to the project
        const projectWithPartner: Omit<ModelProjectI, 'id' | 'createdAt' | 'updatedAt'> = {
            ...newProject,
            partnerId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
        }

        console.log("[page] Creating project via service:", {
            project: projectWithPartner,
            timestamp: new Date().toISOString(),
        })

        // Create project via service (this will make the network call)
        const createdProject = await projectService.createProject(projectWithPartner)

        console.log("[page] Project created successfully:", {
            projectId: createdProject.id,
            timestamp: new Date().toISOString(),
        })

        // Reload projects from server to ensure we have the latest data
        const partnerId = typeof user.id === 'string' ? Number(user.id) : user.id
        const result = await projectService.getAllProjects({
            partnerId: partnerId
        })

        // Store model projects for status filtering
        setModelProjects(result.projects)
        // Convert to UI format and update list
        const uiProjects = result.projects.map((p) => convertModelToUIProject(p))
        setProjects(uiProjects)

        // Don't show success here - let the hook handle it
        // Don't close modal here - let the hook handle it
    }

    /**
     * Handle project status change (move between boards)
     */
    const moveProject = async (projectId: number | string, currentProjectStatus: projectStatus, x: number) => {
        try {
            let newStatus: ProjectStatus

            if (currentProjectStatus === "in-progress" && x > 0) {
                newStatus = "on-hold"
            } else if (currentProjectStatus === "on-hold") {
                newStatus = "in-progress"
            } else {
                return // No change needed
            }

            // Update project via service
            await projectService.updateProject(projectId, { status: newStatus })

            // Update local state
            setProjects((prev) =>
                prev.map((p) => {
                    if (p.id === projectId) {
                        const updatedStatus: projectStatus =
                            newStatus === "in-progress" ? "in-progress" :
                                newStatus === "on-hold" ? "on-hold" :
                                    newStatus === "completed" ? "completed" : "in-progress"
                        return { ...p, status: updatedStatus }
                    }
                    return p
                })
            )
        } catch (error) {
            console.error("Failed to update project status:", error)
            showError("Failed to update project status. Please try again.")
        }
    }

    if (loading) {
        return (
            <div className='w-full flex flex-col h-full overflow-hidden'>
                <ProjectsListSkeleton />
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col h-full overflow-hidden'>

            {/* header  */}
            <div className="flex w-full items-center bg-paper justify-between rounded-lg px-8 py-6 mb-8 flex-shrink-0">

                <div className="flex items-center gap-3">
                    <p className='text-[1rem] font-[600]'>Projects</p>
                    <IconButton icon={<span>{projects.length}</span>} className='bg-pale-primary ' disableShrink />
                </div>

                <Button onClick={() => setOpen(true)} className='bg-accent rounded-full'>
                    Submit new project
                </Button>
            </div>

            {/* projects list  */}
            <div className="flex sm:flex-row flex-col flex-1 gap-6 min-h-0 overflow-x-auto overflow-y-hidden">

                {/* board  */}
                {/* Filter by original model status before conversion */}
                <Board
                    content={projects.filter(p => {
                        const modelProject = modelProjects.find(mp => mp.id === p.id || String(mp.id) === String(p.id))
                        return modelProject?.status === "draft"
                    })}
                    title='Draft'
                />
                <Board
                    content={projects.filter(p => {
                        const modelProject = modelProjects.find(mp => mp.id === p.id || String(mp.id) === String(p.id))
                        return modelProject?.status === "published"
                    })}
                    title='Published'
                />
                <Board
                    onMove={moveProject}
                    content={projects.filter(p => {
                        const modelProject = modelProjects.find(mp => mp.id === p.id || String(mp.id) === String(p.id))
                        return modelProject?.status === "in-progress"
                    })}
                    title='In Progress'
                />
                <Board
                    onMove={moveProject}
                    content={projects.filter(p => p?.status === "on-hold")}
                    title='On Hold'
                />
                <Board
                    content={projects.filter(p => p?.status === "completed")}
                    title='Completed'
                />
            </div>


            {/* add project modal  */}
            <ProjectForm open={open} setOpen={setOpen} onSubmit={handleProjectSubmit} />
        </div>
    )
}

export default page