import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface PersonalRecord {
  liftName: string;
  oneRepMax: number;
  recordedAt: string;
}

export const statsService = {
  getPersonalRecords: async (): Promise<PersonalRecord[]> => {
    try {
      const response = await axiosInstance.get<PersonalRecord[]>(
        API_ENDPOINTS.STATS.GET_PERSONAL_RECORDS
      );

      return response.data;
    } catch (error: any) {
      console.error('Error in getPersonalRecords:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },
};
