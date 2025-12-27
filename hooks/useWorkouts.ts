import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutsService } from '@/api/services/workouts.service';
import type { CreateWorkoutRequest, Workout } from '@/api/types/workouts';

export const WORKOUTS_KEYS = {
  all: ['workouts'] as const,
};

export const useGetWorkouts = () => {
  return useQuery({
    queryKey: WORKOUTS_KEYS.all,
    queryFn: () => workoutsService.getWorkouts(),
  });
};

// Mutation hook for creating a workout
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, CreateWorkoutRequest>({
    mutationFn: (payload) => workoutsService.createWorkout(payload),
    onSuccess: () => {
      // Invalidate any workouts-related queries so lists refresh
      queryClient.invalidateQueries({ queryKey: WORKOUTS_KEYS.all });
    },
  });
};

// Mutation hook for deleting a workout
export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (workoutId) => workoutsService.deleteWorkout(workoutId),
    onSuccess: () => {
      // Invalidate any workouts-related queries so lists refresh
      queryClient.invalidateQueries({ queryKey: WORKOUTS_KEYS.all });
    },
  });
};

// Mutation hook for updating a workout
export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation<Workout, Error, { id: string; data: Partial<CreateWorkoutRequest> }>({
    mutationFn: ({ id, data }) => workoutsService.updateWorkout(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific workout detail and list
      queryClient.invalidateQueries({ queryKey: WORKOUTS_KEYS.all });
    },
  });
};
