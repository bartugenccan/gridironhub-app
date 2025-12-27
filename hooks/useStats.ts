import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statsService, PersonalRecord } from '@/api/services/stats.service';

export const STATS_KEYS = {
  all: ['personalRecords'] as const,
  history: (liftName: string) => ['personalRecordHistory', liftName] as const,
  pendingRequests: ['pendingPrRequests'] as const,
};

export const usePersonalRecords = () => {
  return useQuery({
    queryKey: STATS_KEYS.all,
    queryFn: statsService.getPersonalRecords,
  });
};

export const usePersonalRecordHistory = (liftName: string) => {
  return useQuery({
    queryKey: STATS_KEYS.history(liftName),
    queryFn: () => statsService.getPersonalRecordHistory(liftName),
    enabled: !!liftName,
  });
};

export const useAddPersonalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statsService.addPersonalRecord,
    onSuccess: (_, variables) => {
      // Invalidate main list
      queryClient.invalidateQueries({ queryKey: STATS_KEYS.all });
      // Invalidate specific history if it exists
      queryClient.invalidateQueries({ queryKey: STATS_KEYS.history(variables.liftName) });
    },
  });
};

export const useDeletePersonalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statsService.deletePersonalRecord,
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: STATS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['personalRecordHistory'] });
    },
  });
};

export const useCreatePrRequest = () => {
  return useMutation({
    mutationFn: statsService.createPrRequest,
  });
};

export const usePendingPrRequests = () => {
  return useQuery({
    queryKey: STATS_KEYS.pendingRequests,
    queryFn: statsService.getPendingPrRequests,
  });
};

export const useUpdatePrRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: import('@/api/services/stats.service').UpdatePrRequestStatusDTO;
    }) => statsService.updatePrRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATS_KEYS.pendingRequests });
      queryClient.invalidateQueries({ queryKey: STATS_KEYS.all });
    },
  });
};
