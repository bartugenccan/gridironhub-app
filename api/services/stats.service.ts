import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface PersonalRecord {
  id: string;
  liftName: string;
  oneRepMax: number;
  recordedAt: string;
}

export type PrRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PrRequest {
  id: string;
  userId: string;
  liftName: string;
  value: number;
  videoUrl: string;
  status: PrRequestStatus;
  coachNotes?: string;
  createdAt: string;
  updatedAt: string;
  playerName?: string;
}

export interface CreatePrRequestDTO {
  liftName: string;
  value: number;
  videoUrl: string;
  strengthLogId?: string;
}

export interface UpdatePrRequestStatusDTO {
  status: PrRequestStatus;
  coachNotes?: string;
}

export const statsService = {
  getPersonalRecords: async (): Promise<PersonalRecord[]> => {
    try {
      const response = await axiosInstance.get<PersonalRecord[]>(
        API_ENDPOINTS.STATS.GET_PERSONAL_RECORDS,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      );

      // Handle 304 Not Modified or empty response
      if (!response.data) {
        console.warn('No data received, returning empty array');
        return [];
      }

      // Backend already returns camelCase, no mapping needed
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
        id: item.id,
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

  deletePersonalRecord: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.STATS.DELETE_PERSONAL_RECORD}/${id}`);
    } catch (error: any) {
      console.error('Error in deletePersonalRecord:', error);
      throw error;
    }
  },

  createPrRequest: async (data: FormData): Promise<PrRequest> => {
    try {
      const response = await axiosInstance.post<any>(API_ENDPOINTS.STATS.CREATE_PR_REQUEST, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          return data;
        },
      });
      return mapPrRequest(response.data);
    } catch (error: any) {
      console.error('Error in createPrRequest:', error);
      throw error;
    }
  },

  getPendingPrRequests: async (): Promise<PrRequest[]> => {
    try {
      const response = await axiosInstance.get<any[]>(API_ENDPOINTS.STATS.GET_PR_REQUESTS);
      return response.data.map(mapPrRequest);
    } catch (error: any) {
      console.error('Error in getPendingPrRequests:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePrRequestStatus: async (id: string, data: UpdatePrRequestStatusDTO): Promise<PrRequest> => {
    try {
      const response = await axiosInstance.patch<any>(
        `${API_ENDPOINTS.STATS.UPDATE_PR_REQUEST_STATUS}/${id}`,
        data
      );
      return mapPrRequest(response.data);
    } catch (error: any) {
      console.error('Error in updatePrRequestStatus:', error);
      throw error;
    }
  },
};

const mapPrRequest = (data: any): PrRequest => ({
  id: data.id,
  userId: data.user_id,
  liftName: data.lift_name,
  value: data.value,
  videoUrl: data.video_url,
  status: data.status,
  coachNotes: data.coach_notes,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  playerName: data.player_name,
});
