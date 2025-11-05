/**
 * Group model - represents student groups for project applications
 */
export interface GroupI {
  id: number;
  courseId: string;
  leaderId: string;
  memberIds: string[];
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

