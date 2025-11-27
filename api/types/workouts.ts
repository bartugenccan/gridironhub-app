export interface Workout {
  id: string;
  name: string;
  description: string | null;
  duration: number; // in minutes
  type: 'team' | 'position';
  targetPositions?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutsResponse {
  teamWorkouts: Workout[];
  positionWorkouts: Workout[];
}
