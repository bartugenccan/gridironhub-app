import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../types/auth';

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // Validate request data before API call
  const validatedData = loginSchema.parse(data);

  const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, validatedData);
  return response.data;
};

const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  // Validate request data before API call
  const validatedData = registerSchema.parse(data);

  const response = await axiosInstance.post<RegisterResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    validatedData
  );
  return response.data;
};

const forgotPassword = async (email: string): Promise<void> => {
  // Validate email before API call
  const validatedData = forgotPasswordSchema.parse({ email });

  await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, validatedData);
};

const validateToken = async (): Promise<LoginResponse> => {
  const response = await axiosInstance.get<LoginResponse>(API_ENDPOINTS.AUTH.ME, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  return response.data;
};

export const authService = {
  login,
  register,
  forgotPassword,
  validateToken,
};
