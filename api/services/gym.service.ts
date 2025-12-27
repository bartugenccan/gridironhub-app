import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { CheckinResponse, CreateCheckinDTO, CheckinHistoryResponse } from '../types/gym';

export const gymService = {
  checkIn: async (data: CreateCheckinDTO): Promise<CheckinResponse> => {
    const response = await axiosInstance.post<CheckinResponse>(API_ENDPOINTS.GYM.CHECKIN, data);
    return response.data;
  },

  getHistory: async (): Promise<CheckinHistoryResponse> => {
    const response = await axiosInstance.get<CheckinHistoryResponse>(API_ENDPOINTS.GYM.HISTORY);
    return response.data;
  },

  getAllCheckins: async (): Promise<CheckinHistoryResponse> => {
    // Assuming the response structure is the same for all checkins for simplicity,
    // or we might need a different type if the backend wraps it differently.
    // Based on "optimize şekilde görebileceği", might just be a list of checkins.
    const response = await axiosInstance.get<CheckinHistoryResponse>(
      API_ENDPOINTS.GYM.ALL_CHECKINS
    );
    return response.data;
  },
};
