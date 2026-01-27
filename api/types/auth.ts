import { BaseResponse } from '../common';
import { User } from './user';
import {
  loginSchema,
  registerSchema,
  apiRegisterSchema,
  forgotPasswordSchema,
  type LoginSchema,
  type RegisterSchema,
  type UserRole as ZodUserRole,
} from '@/validations/auth.schema';
import { z } from 'zod';

// Export Zod schemas for validation
export { loginSchema, registerSchema, apiRegisterSchema, forgotPasswordSchema };

// Type aliases using Zod inferred types
export type LoginRequest = LoginSchema;
export type RegisterRequest = z.infer<typeof apiRegisterSchema>;
export type ResetPasswordRequest = {
  accessToken: string;
  newPassword: string;
};
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
    teamName: string;
  };
}

// Registration now puts user in pending state, no immediate session
export interface RegisterResponse extends BaseResponse {
  message: string;
}
