import axiosInstance from '../client';
import { RegisterTokenRequest, RegisterTokenResponse } from '../types/notifications';
import { API_ENDPOINTS } from '../endpoints';

const registerPushToken = async (token: string): Promise<RegisterTokenResponse> => {
  const response = await axiosInstance.post<RegisterTokenResponse>(
    API_ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN,
    {
      token,
    }
  );
  return response.data;
};

export const notificationsService = {
  registerPushToken,
};
