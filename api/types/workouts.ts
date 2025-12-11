export interface Workout {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number; // in minutes
  assignedToPositions?: string[] | null;
  difficultyLevel?: string | null;
  equipmentNeeded?: string[] | null;
  scheduledDate?: string | null; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutsResponse {
  teamWorkouts: Workout[];
  positionWorkouts: Workout[];
}

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  assignedToPositions?: string[];
  difficultyLevel?: string;
  equipmentNeeded?: string[];
  scheduledDate?: string; // ISO date string (YYYY-MM-DD)
  youtubeUrl?: string; // YouTube video URL
}
