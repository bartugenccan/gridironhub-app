import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['coach', 'player']);

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email adresi gereklidir')
  .email('Geçerli bir email adresi giriniz')
  .toLowerCase()
  .trim();

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(100, 'Şifre en fazla 100 karakter olabilir');

// Strong password schema (for registration)
export const strongPasswordSchema = passwordSchema
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir');

// Login request schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema,
});

// Register request schema
export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  role: userRoleSchema,
  teamId: z.string().min(1, 'Takım Kodu gereklidir').trim(),
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .trim(),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Type exports
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
