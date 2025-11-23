import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerService } from '@/api/services/player.service';
import { PlayerProfile, UpdatePlayerProfileRequest } from '@/api/types/player';
import { useAuth } from '@/contexts/AuthContext';

// Hook to fetch a specific player's profile (for roster view)
export const usePlayerProfile = (playerId: string) => {
  return useQuery<PlayerProfile, Error>({
    queryKey: ['playerProfile', playerId],
    queryFn: () => playerService.getPlayerProfile(playerId),
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch the current logged-in user's player profile
export const useCurrentPlayerProfile = () => {
  const { user } = useAuth();

  return useQuery<PlayerProfile, Error>({
    queryKey: ['currentPlayerProfile', user?.id],
    queryFn: () => playerService.getCurrentPlayerProfile(user!.id),
    enabled: !!user?.id, // Only fetch if user ID exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once if it fails
  });
};

// Hook to update player profile with optimistic updates
export const useUpdatePlayerProfile = () => {
  const queryClient = useQueryClient();

  type MutationVariables = { playerId: string; data: UpdatePlayerProfileRequest };
  type MutationContext = {
    previousCurrentProfile?: PlayerProfile;
    previousPlayerProfile?: PlayerProfile;
  };

  return useMutation<PlayerProfile, Error, MutationVariables, MutationContext>({
    mutationFn: ({ playerId, data }) => playerService.updatePlayerProfile(playerId, data),

    // Optimistic update: immediately update the UI before the request completes
    onMutate: async ({ playerId, data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['currentPlayerProfile'] });
      await queryClient.cancelQueries({ queryKey: ['playerProfile', playerId] });

      // Snapshot the previous values
      const previousCurrentProfile = queryClient.getQueryData<PlayerProfile>([
        'currentPlayerProfile',
      ]);
      const previousPlayerProfile = queryClient.getQueryData<PlayerProfile>([
        'playerProfile',
        playerId,
      ]);

      // Optimistically update to the new value
      if (previousCurrentProfile) {
        queryClient.setQueryData<PlayerProfile>(['currentPlayerProfile'], {
          ...previousCurrentProfile,
          ...data,
        });
      }

      if (previousPlayerProfile) {
        queryClient.setQueryData<PlayerProfile>(['playerProfile', playerId], {
          ...previousPlayerProfile,
          ...data,
        });
      }

      // Return context with the previous values
      return { previousCurrentProfile, previousPlayerProfile };
    },

    // On error, rollback to the previous values
    onError: (err, { playerId }, context) => {
      const { user } = useAuth();
      if (context?.previousCurrentProfile) {
        queryClient.setQueryData(
          ['currentPlayerProfile', user?.id],
          context.previousCurrentProfile
        );
      }
      if (context?.previousPlayerProfile) {
        queryClient.setQueryData(['playerProfile', playerId], context.previousPlayerProfile);
      }
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, { playerId }) => {
      queryClient.invalidateQueries({ queryKey: ['currentPlayerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile', playerId] });
    },
  });
};
