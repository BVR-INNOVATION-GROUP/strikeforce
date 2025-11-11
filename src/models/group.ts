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
}

