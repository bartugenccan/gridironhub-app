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

  getPersonalRecordHistory: async (liftName: string): Promise<PersonalRecord[]> => {
    try {
      const response = await axiosInstance.get<any[]>(
        API_ENDPOINTS.STATS.GET_PERSONAL_RECORD_HISTORY,
        {
          params: { liftName },
        }
      );

      // Map snake_case to camelCase
      return response.data.map((item) => ({
        liftName: item.lift_name,
        oneRepMax: item.one_rep_max,
        recordedAt: item.recorded_at,
      }));
    } catch (error: any) {
      console.error('Error in getPersonalRecordHistory:', error);
      throw error;
    }
  },

  updatePersonalRecord: async (data: {
    liftName: string;
    oneRepMax: number;
    notes?: string;
  }): Promise<PersonalRecord> => {
    try {
      const response = await axiosInstance.post<PersonalRecord>(
        API_ENDPOINTS.STATS.UPDATE_PERSONAL_RECORD,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in updatePersonalRecord:', error);
      throw error;
    }
  },
  addPersonalRecord: async (data: {
    liftName: string;
    oneRepMax: number;
    recordedAt?: string;
    notes?: string;
  }): Promise<PersonalRecord> => {
    try {
      const response = await axiosInstance.post<PersonalRecord>(
        API_ENDPOINTS.STATS.UPDATE_PERSONAL_RECORD, // Using the same endpoint for creation as per request
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in addPersonalRecord:', error);
      throw error;
    }
  },
};
