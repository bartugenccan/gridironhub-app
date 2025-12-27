import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { BaseResponse } from '../common';

export interface Team {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string;
}

export const teamService = {
  getTeams: async (): Promise<Team[]> => {
    const response = await axiosInstance.get<Team[]>(API_ENDPOINTS.TEAMS.GET_TEAMS);
    return response.data;
  },
};
