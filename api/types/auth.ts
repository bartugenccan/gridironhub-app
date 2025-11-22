import { BaseResponse } from '../common';
import { User } from './user';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginSchema,
  type RegisterSchema,
  type UserRole as ZodUserRole,
} from '@/validations/auth.schema';

// Export Zod schemas for validation
export { loginSchema, registerSchema, forgotPasswordSchema };

// Type aliases using Zod inferred types
export type LoginRequest = LoginSchema;
export type RegisterRequest = RegisterSchema;
export type UserRole = ZodUserRole;

export interface LoginResponse extends BaseResponse {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    teamId: string;
  };
}

export interface RegisterResponse extends BaseResponse {
  data: {
    user: {
      id: string;
      email: string;
      role: UserRole;
      metadata: Record<string, unknown>;
    };
    token: string;
  };
}
