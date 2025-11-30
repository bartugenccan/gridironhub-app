import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { WorkoutsResponse } from '../types/workouts';
import { WorkoutsDetail } from '../types/workoutsDetail';

export const workoutsService = {
  getWorkouts: async (): Promise<WorkoutsResponse> => {
    const response = await axiosInstance.get<WorkoutsResponse>(API_ENDPOINTS.WORKOUTS.GET_WORKOUTS);
    return response.data;
  },

  getWorkoutDetail: async (id: string): Promise<WorkoutsDetail> => {
    const response = await axiosInstance.get<WorkoutsDetail>(
      API_ENDPOINTS.WORKOUTS.GET_WORKOUTS_DETAIL.replace(':id', id)
    );
    return response.data;
  },
};
