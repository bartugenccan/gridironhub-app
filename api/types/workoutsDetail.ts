export interface WorkoutsDetail {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  assignedToPositions: string[] | null;
  equipmentNeeded: string[] | null;
  createdAt: string;
  updatedAt: string;
  youtubeUrl: string | null;
}

export interface WorkoutsDetailResponse {
  teamWorkouts: WorkoutsDetail[];
  positionWorkouts: WorkoutsDetail[];
}
