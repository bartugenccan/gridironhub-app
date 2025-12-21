import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gymService } from '../api/services/gym.service';
import { CreateCheckinDTO, CheckinResponse, CheckinHistoryResponse } from '../api/types/gym';

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation<CheckinResponse, Error, CreateCheckinDTO>({
    mutationFn: gymService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-history'] });
      queryClient.invalidateQueries({ queryKey: ['all-checkins'] });
    },
  });
};

export const useCheckInHistory = () => {
  return useQuery<CheckinHistoryResponse, Error>({
    queryKey: ['gym-history'],
    queryFn: gymService.getHistory,
  });
};

export const useAllCheckins = () => {
  return useQuery<CheckinHistoryResponse, Error>({
    queryKey: ['all-checkins'],
    queryFn: gymService.getAllCheckins,
  });
};
