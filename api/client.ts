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
      } else {
        console.warn('⚠️ No access token found for protected route:', config.url);
      }
    }

    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Debug logging for all errors
    console.error('🔴 API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method,
      data: error.response?.data,
    });

    if (error.response?.status === 404) {
      console.error('❌ 404 Not Found - Full details:', {
        requestedURL: error.config?.url,
        baseURL: error.config?.baseURL,
        envApiUrl: ENV.apiUrl,
      });
    }

    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized:', error.config?.url);
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      // Handle unauthorized - could clear tokens and redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
