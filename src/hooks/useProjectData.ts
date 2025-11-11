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
import { getUseMockData } from '@/src/utils/config'

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

                // Load applications for this project - use API to get all applications
                try {
                    // Convert projectId to number (URL params come as strings)
                    const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId
                    
                    if (getUseMockData()) {
                        // Mock mode: Load from JSON file
                        const appsData = await import("@/src/data/mockApplications.json")
                        const allApps = appsData.default as ApplicationI[]
                        // Handle both string and number projectId in mock data
                        const projectApps = allApps.filter(app => {
                            const appProjectId = typeof app.projectId === 'string' 
                                ? parseInt(app.projectId, 10) 
                                : app.projectId;
                            return appProjectId === numericProjectId;
                        })
                        setApplications(projectApps)
                    } else {
                        // Production mode: Fetch from API
                        const projectApps = await applicationService.getProjectApplications(numericProjectId)
                        setApplications(projectApps)
                    }
                } catch (error) {
                    console.error("Failed to load applications:", error)
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

