"use client"
import Button from '@/src/components/core/Button'
import IconButton from '@/src/components/core/IconButton'
import Board from '@/src/components/screen/partner/projects/Board'
import Project, { ProjectI, projectStatus } from '@/src/components/screen/partner/projects/Project'
import ProjectForm from '@/src/components/screen/partner/projects/ProjectForm'
import { ProjectI as ModelProjectI, ProjectStatus } from '@/src/models/project'
import { useProjectStore } from '@/src/store/useProjectStore'
import React, { useEffect, useState } from 'react'
import { mockPartnerProjects } from '@/src/data/mockPartnerProjects'
import { convertModelToUIProject, convertUIToModelProject } from '@/src/utils/projectConversion'

const page = () => {
    const { projects: storedProjects, setProjects, addProject } = useProjectStore()
    const [localProjects, setLocalProjects] = useState<ProjectI[]>(mockPartnerProjects)

    // Initialize store with local projects on mount
    useEffect(() => {
        if (storedProjects.length === 0 && localProjects.length > 0) {
            // Convert UI projects to model format for store
            // For now, we'll keep using local state and sync when projects are added
        }
    }, [])

    // Use local projects but sync with store when adding new ones
    const projects = localProjects

    const [open, setOpen] = useState(false)

    /**
     * Handle new project submission from form
     * Adds the project to the client-side state
     */
    const handleProjectSubmit = (newProject: Omit<ModelProjectI, 'id' | 'createdAt' | 'updatedAt' | 'partnerId'>) => {
        const uiProject = convertModelToUIProject(newProject)
        setLocalProjects((prev) => [...prev, uiProject])
        const modelProject = convertUIToModelProject(uiProject, newProject)
        addProject(modelProject)
    }

    const moveProject = (projectId: number | string, currentProjectStatus: projectStatus, x: number) => {

        if (currentProjectStatus === "in-progress" && x > 0) {
            setLocalProjects(projects?.map((p) => p.id === projectId ? ({ ...p, status: "on-hold" }) : p))
        }
        else if (currentProjectStatus == "on-hold") {
            setLocalProjects(projects?.map((p) => p.id === projectId ? ({ ...p, status: "in-progress" }) : p))
        }


    }

    return (
        <div className='w-full flex flex-col h-full overflow-hidden'>

            {/* header  */}
            <div className="flex w-full items-center bg-paper justify-between rounded-lg px-8 py-6 mb-8 flex-shrink-0">

                <div className="flex items-center gap-3">
                    <p className='text-[1rem] font-[600]'>Projects</p>
                    <IconButton icon={<span>9+</span>} className='bg-pale-primary ' disableShrink />
                </div>

                <Button onClick={() => setOpen(true)} className='bg-accent rounded-full'>
                    Submit new project
                </Button>
            </div>

            {/* projects list  */}
            <div className="flex sm:flex-row flex-col flex-1 gap-6 min-h-0 overflow-hidden">

                {/* board  */}
                <Board onMove={moveProject} content={projects.filter(p => p?.status == "in-progress")} title='In Progress' />
                <Board onMove={moveProject} content={projects.filter(p => p?.status == "on-hold")} title='On Hold' />
                <Board content={projects.filter(p => p?.status == "completed")} title='Completed' />
            </div>


            {/* add project modal  */}
            <ProjectForm open={open} setOpen={setOpen} onSubmit={handleProjectSubmit} />
        </div>
    )
}

export default page