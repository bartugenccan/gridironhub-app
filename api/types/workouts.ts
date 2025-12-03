export interface Workout {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number; // in minutes
  type: 'team' | 'position';
  targetPositions?: string[] | null;
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
  type: 'team' | 'position';
  targetPositions?: string[];
}
