/**
 * Group model - represents student groups for project applications
 */
export interface GroupI {
  id: number;
  courseId: number;
  leaderId: number; // User ID (numeric)
  memberIds: number[]; // User IDs (numeric)
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  // Optional: member details from backend (when preloaded)
  members?: Array<{
    id: number;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      bio?: string;
      phone?: string;
      location?: string;
    };
  }>;
  // Optional: leader details from backend (when preloaded)
  user?: {
    id: number;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      bio?: string;
      phone?: string;
      location?: string;
    };
  };
}
