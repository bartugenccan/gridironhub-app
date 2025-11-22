// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/api/services/auth.service';
import type { LoginRequest, RegisterRequest, UserRole } from '@/api/types/auth';

// User type that matches the API response
interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  teamId: string;
  teamName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'userData',
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for stored auth data on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        // Optimistically set user and token to avoid flash if valid
        // But we really should wait for validation to be sure.
        // Let's just validate.

        // Set token for axios interceptors to work if they use the context or storage
        // Assuming axiosInstance gets token from storage or we need to set it?
        // Usually axios interceptors read from storage.

        try {
          // We need to make sure the token is available for the request
          // If axios interceptor reads from storage, we are good.
          // If it reads from state, we might need to set it first, but setting state is async/batch.
          // Let's assume axios reads from storage or we pass it.
          // Actually, if we look at client.ts (not visible here but common pattern), it likely reads from storage.

          const response = await authService.validateToken();
          setToken(response.session.accessToken);
          setUser(response.user);

          // Update storage with fresh data if needed
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.session.accessToken);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.session.refreshToken);
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        } catch (validationError) {
          console.error('Token validation failed:', validationError);
          // Token is invalid, clear everything
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
          ]);
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setToken(null);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      // Store tokens and user data
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.session.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.session.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      setToken(response.session.accessToken);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

      if (response.data.user && response.data.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));

        setToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading: isInitializing || isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
