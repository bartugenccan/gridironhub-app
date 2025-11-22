import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import ENV from '@/config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const publicRoutes = ['/api/auth/login', '/api/auth/register'];

const axiosInstance = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const isPublicRoute = publicRoutes.some((route) => config.url?.includes(route));

    if (!isPublicRoute) {
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
