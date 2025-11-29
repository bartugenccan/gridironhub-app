import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { WorkoutsDetailResponse } from '../types/workoutsDetail';

export const workoutsDetailService = {
  getWorkouts: async (): Promise<WorkoutsDetailResponse> => {
    const response = await axiosInstance.get<WorkoutsDetailResponse>(
      API_ENDPOINTS.WORKOUTS.GET_WORKOUTS
    );
    return response.data;
  },
};
