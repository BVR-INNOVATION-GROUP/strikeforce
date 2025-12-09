import { collegeRepository } from "@/src/repositories/collegeRepository";
import { CollegeI } from "@/src/models/college";

export const collegeService = {
  getAllColleges: async (): Promise<CollegeI[]> => {
    return collegeRepository.getAll();
  },

  getCollegeById: async (id: string | number): Promise<CollegeI> => {
    return collegeRepository.getById(id);
  },

  createCollege: async (name: string): Promise<CollegeI> => {
    if (!name || name.trim().length === 0) {
      throw new Error("College name is required");
    }
    return collegeRepository.create({ name: name.trim() });
  },

  updateCollege: async (id: string | number, name: string): Promise<CollegeI> => {
    if (!name || name.trim().length === 0) {
      throw new Error("College name is required");
    }
    return collegeRepository.update(id, { name: name.trim() });
  },

  deleteCollege: async (id: string | number): Promise<void> => {
    return collegeRepository.delete(id);
  },
};

