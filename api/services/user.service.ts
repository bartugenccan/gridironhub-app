import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { UpdateProfileRequest, UpdateProfileResponse, UserProfile } from '../types';

const getProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>(API_ENDPOINTS.USER.GET_PROFILE);
  return response.data;
};

const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.post<UpdateProfileResponse>(
    API_ENDPOINTS.USER.UPDATE_PROFILE,
    data
  );
  return response.data;
};

export const userService = {
  getProfile,
  updateProfile,
};
