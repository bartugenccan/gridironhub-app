import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { PlayerProfile, UpdatePlayerProfileRequest } from '../types/player';

export const playerService = {
  getPlayerProfile: async (playerId: string): Promise<PlayerProfile> => {
    const response = await axiosInstance.get<PlayerProfile>(
      `${API_ENDPOINTS.PLAYER.GET_PROFILE}/${playerId}`
    );
    return response.data;
  },

  getCurrentPlayerProfile: async (userId: string): Promise<PlayerProfile> => {
    // Use the user's ID to fetch their profile
    const response = await axiosInstance.get<PlayerProfile>(
      `${API_ENDPOINTS.PLAYER.GET_PROFILE}/${userId}`
    );
    return response.data;
  },

  updatePlayerProfile: async (
    playerId: string,
    data: UpdatePlayerProfileRequest
  ): Promise<PlayerProfile> => {
    const response = await axiosInstance.patch<PlayerProfile>(
      `${API_ENDPOINTS.PLAYER.UPDATE_PROFILE}/${playerId}`,
      data
    );
    return response.data;
  },
};
