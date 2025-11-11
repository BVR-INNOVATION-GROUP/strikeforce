/**
 * Custom hook for project details page handlers
 * Composes multiple action hooks
 */
import { useProjectActions } from './useProjectActions'
import { useProjectMutations } from './useProjectMutations'

export const useProjectDetails = (projectId: string) => {
    const actions = useProjectActions(projectId)
    const mutations = useProjectMutations(projectId)

    return {
        ...actions,
        ...mutations
    }
}

