import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statsService, PersonalRecord } from '@/api/services/stats.service';

export const STATS_KEYS = {
  all: ['personalRecords'] as const,
  history: (liftName: string) => ['personalRecordHistory', liftName] as const,
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
