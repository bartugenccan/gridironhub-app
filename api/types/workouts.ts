export interface Workout {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number; // in minutes
  assignedToPositions?: string[] | null;
  difficultyLevel?: string | null;
  equipmentNeeded?: string[] | null;
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
}
