import { z } from 'zod';

/**
 * Format Zod validation errors into a user-friendly message
 */
export const formatZodError = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  return firstError?.message || 'Geçersiz veri';
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (error: z.ZodError, fieldName: string): string | undefined => {
  const fieldError = error.issues.find((err) => err.path[0] === fieldName);
  return fieldError?.message;
};

/**
 * Get all field errors as an object
 */
export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err: z.ZodIssue) => {
    const fieldName = err.path[0] as string;
    if (fieldName && !errors[fieldName]) {
      errors[fieldName] = err.message;
    }
  });
  return errors;
};

/**
 * Validate data with a schema and return typed result
 */
export const validateData = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
};

/**
 * Validate a single field
 */
export const validateField = <T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): { valid: true; value: z.infer<T> } | { valid: false; error: string } => {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true, value: result.data };
  }

  return { valid: false, error: formatZodError(result.error) };
};
