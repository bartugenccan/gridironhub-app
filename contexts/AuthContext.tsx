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
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
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
            await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER]);
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