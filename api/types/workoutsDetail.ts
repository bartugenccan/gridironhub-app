export interface WorkoutsDetail {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  assignedToPositions: string[] | null;
  difficultyLevel: string | null;
  equipmentNeeded: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutsDetailResponse {
  teamWorkouts: WorkoutsDetail[];
  positionWorkouts: WorkoutsDetail[];
}
