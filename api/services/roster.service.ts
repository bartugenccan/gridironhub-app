import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { RosterResponse } from '../types/roster';

export const rosterService = {
  getRoster: async (): Promise<RosterResponse> => {
    const response = await axiosInstance.get<RosterResponse>(API_ENDPOINTS.ROSTER.GET_ROSTER);
    return response.data;
  },
};
