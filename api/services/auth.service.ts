import axiosInstance from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../types';
import {
  loginSchema,
  registerSchema,
  apiRegisterSchema,
  forgotPasswordSchema,
} from '../types/auth';

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // Validate request data before API call
  const validatedData = loginSchema.parse(data);

  const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, validatedData);

  console.log('Login response: ', response.data);
  console.log('Endpoint: ', axiosInstance.defaults.baseURL);

  return response.data;
};

const register = async (data: RegisterRequest): Promise<void> => {
  // Validate request data before API call
  const validatedData = apiRegisterSchema.parse(data);

  await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, validatedData);
};

const forgotPassword = async (email: string, redirectTo?: string): Promise<void> => {
  // Validate email before API call
  const validatedData = forgotPasswordSchema.parse({ email, redirectTo });

  await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, validatedData);
};

const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  // Validate password (min length etc) - generally validated by schema before calling this,
  // but passing it to API. The API expects { accessToken, newPassword }
  await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
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
  resetPassword,
  validateToken,
};
