import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { CoachProfile, UpdateCoachProfileRequest } from '../types/coach';

// Define types locally if not available yet
interface PendingUser {
  userId: string;
  fullName: string; // or firstName + lastName
  email: string;
  role: 'player' | 'coach';
  createdAt: string;
}

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

  getPendingUsers: async (teamId: string): Promise<PendingUser[]> => {
    // Replace URL parameter :id with actual teamId
    const url = API_ENDPOINTS.TEAMS.GET_TEAM_MEMBERS.replace(':id', teamId);
    // Append query param for status=pending
    const response = await axiosInstance.get<PendingUser[]>(url, {
      params: { status: 'pending' },
    });
    return response.data;
  },

  approveUser: async (userId: string, action: 'approve' | 'reject'): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.APPROVE_USER, { userId, action });
  },
};
