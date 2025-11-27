import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { WorkoutsResponse } from '../types/workouts';

export const workoutsService = {
  getWorkouts: async (): Promise<WorkoutsResponse> => {
    const response = await axiosInstance.get<WorkoutsResponse>(API_ENDPOINTS.WORKOUTS.GET_WORKOUTS);
    return response.data;
  },
};
