import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { WorkoutsResponse, CreateWorkoutRequest, Workout } from '../types/workouts';
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

  createWorkout: async (data: CreateWorkoutRequest): Promise<Workout> => {
    const response = await axiosInstance.post<Workout>(API_ENDPOINTS.WORKOUTS.CREATE_WORKOUT, data);
    return response.data;
  },

  deleteWorkout: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.WORKOUTS.DELETE_WORKOUT.replace(':id', id));
  },

  updateWorkout: async (id: string, data: Partial<CreateWorkoutRequest>): Promise<Workout> => {
    const response = await axiosInstance.put<Workout>(
      API_ENDPOINTS.WORKOUTS.UPDATE_WORKOUT.replace(':id', id),
      data
    );
    return response.data;
  },
};
