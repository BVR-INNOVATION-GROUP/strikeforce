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

                // Load applications for this project
                try {
                    const appsData = await import("@/src/data/mockApplications.json")
                    const allApps = appsData.default as ApplicationI[]
                    // Convert projectId to number (URL params come as strings)
                    const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId
                    const projectApps = allApps.filter(app => app.projectId === numericProjectId)
                    setApplications(projectApps)
                } catch (error) {
                    console.error("Failed to load applications:", error)
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

