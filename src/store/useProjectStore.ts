/**
 * Project Store - Zustand store for managing project state
 * Stores projects client-side for access across components
 */
import { create } from "zustand";
import { ProjectI } from "@/src/models/project";

interface ProjectStore {
  projects: ProjectI[];
  setProjects: (projects: ProjectI[]) => void;
  addProject: (project: ProjectI) => void;
  updateProject: (id: string, updates: Partial<ProjectI>) => void;
  getProjectById: (id: string | number) => ProjectI | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id);
  },
}));





