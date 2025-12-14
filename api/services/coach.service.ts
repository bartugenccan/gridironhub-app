import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { CoachProfile, UpdateCoachProfileRequest } from '../types/coach';

export const coachService = {
  getCoachProfile: async (coachId: string): Promise<CoachProfile> => {
    const response = await axiosInstance.get<CoachProfile>(
      `${API_ENDPOINTS.COACH.GET_PROFILE}/${coachId}`
    );
    return response.data;
  },

  getCurrentCoachProfile: async (userId: string): Promise<CoachProfile> => {
    // Use the user's ID to fetch their profile
    const response = await axiosInstance.get<CoachProfile>(
      `${API_ENDPOINTS.COACH.GET_PROFILE}/${userId}`
    );
    return response.data;
  },

  updateCoachProfile: async (
    coachId: string,
    data: UpdateCoachProfileRequest
  ): Promise<CoachProfile> => {
    const response = await axiosInstance.patch<CoachProfile>(
      `${API_ENDPOINTS.COACH.UPDATE_PROFILE}/${coachId}`,
      data
    );
    return response.data;
  },
};
