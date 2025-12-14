import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachService } from '@/api/services/index';
import { CoachProfile, UpdateCoachProfileRequest } from '@/api/types/index';
import { useAuth } from '@/contexts/AuthContext';

// Hook to fetch a specific player's profile (for roster view)
export const useCoachProfile = (playerId: string) => {
  return useQuery<CoachProfile, Error>({
    queryKey: ['playerProfile', playerId],
    queryFn: () => coachService.getCoachProfile(playerId),
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch the current logged-in user's player profile
export const useCurrentCoachProfile = () => {
  const { user } = useAuth();

  return useQuery<CoachProfile, Error>({
    queryKey: ['currentCoachProfile', user?.id],
    queryFn: () => coachService.getCurrentCoachProfile(user!.id),
    enabled: !!user?.id, // Only fetch if user ID exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once if it fails
  });
};

// Hook to update player profile with optimistic updates
export const useUpdateCoachProfile = () => {
  const queryClient = useQueryClient();

  type MutationVariables = { coachId: string; data: UpdateCoachProfileRequest };
  type MutationContext = {
    previousCurrentProfile?: CoachProfile;
    previousCoachProfile?: CoachProfile;
  };

  return useMutation<CoachProfile, Error, MutationVariables, MutationContext>({
    mutationFn: ({ coachId, data }) => coachService.updateCoachProfile(coachId, data),
    // Optimistic update: immediately update the UI before the request completes
    onMutate: async ({ coachId, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['currentCoachProfile'] });
      await queryClient.cancelQueries({ queryKey: ['coachProfile', coachId] });

      // Snapshot the previous values
      const previousCurrentProfile = queryClient.getQueryData<CoachProfile>([
        'currentCoachProfile',
      ]);
      const previousCoachProfile = queryClient.getQueryData<CoachProfile>([
        'coachProfile',
        coachId,
      ]);

      // Optimistically update to the new value
      if (previousCurrentProfile) {
        queryClient.setQueryData<CoachProfile>(['currentCoachProfile'], {
          ...previousCurrentProfile,
          ...data,
        });
      }

      if (previousCoachProfile) {
        queryClient.setQueryData<CoachProfile>(['coachProfile', coachId], {
          ...previousCoachProfile,
          ...data,
        });
      }

      // Return context with the previous values
      return { previousCurrentProfile, previousCoachProfile };
    },

    // On error, rollback to the previous values
    onError: (err, { coachId }, context) => {
      const { user } = useAuth();
      if (context?.previousCurrentProfile) {
        queryClient.setQueryData(['currentCoachProfile', user?.id], context.previousCurrentProfile);
      }
      if (context?.previousCoachProfile) {
        queryClient.setQueryData(['coachProfile', coachId], context.previousCoachProfile);
      }
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, { coachId }) => {
      queryClient.invalidateQueries({ queryKey: ['currentCoachProfile'] });
      queryClient.invalidateQueries({ queryKey: ['coachProfile', coachId] });
    },
  });
};
