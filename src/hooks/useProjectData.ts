/**
 * Custom hook for fetching project data
 * Handles data fetching logic separately
 */
import { useState, useEffect } from 'react'
import { ProjectI } from '@/src/models/project'
import { ApplicationI } from '@/src/models/application'
import { MilestoneI } from '@/src/models/milestone'
import { projectService } from '@/src/services/projectService'
import { milestoneService } from '@/src/services/milestoneService'
import { applicationService } from '@/src/services/applicationService'
import { useProjectStore } from '@/src/store/useProjectStore'

export const useProjectData = (projectId: string) => {
    const { getProjectById } = useProjectStore()
    const [loading, setLoading] = useState(true)
    const [projectData, setProjectData] = useState<ProjectI | null>(null)
    const [applications, setApplications] = useState<ApplicationI[]>([])
    const [milestones, setMilestones] = useState<MilestoneI[]>([])

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId) return

            setLoading(true)
            try {
                // Try to get from store first
                const storedProject = getProjectById(projectId)

                if (storedProject) {
                    setProjectData(storedProject)
                } else {
                    // Fetch from API
                    const fetchedProject = await projectService.getProjectById(projectId)
                    setProjectData(fetchedProject)
                }

                // Load applications for this project (non-critical - continue if it fails)
                try {
                    const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId
                    const projectApps = await applicationService.getProjectApplications(numericProjectId)
                    setApplications(projectApps)
                } catch (error: any) {
                    // Log warning but don't block UI - applications are optional for project display
                    console.warn("Failed to load applications (non-critical):", error?.message || error)
                    setApplications([])
                }

                // Load milestones for this project
                try {
                    const projectMilestones = await milestoneService.getProjectMilestones(projectId)
                    setMilestones(projectMilestones)
                } catch (error) {
                    console.error("Failed to load milestones:", error)
                }
            } catch (error) {
                console.error("Failed to fetch project:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProjectData()
    }, [projectId, getProjectById])

    return {
        loading,
        projectData,
        applications,
        milestones,
        setProjectData,
        setApplications,
        setMilestones
    }
}

