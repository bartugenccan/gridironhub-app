import { z } from 'zod';

// YouTube URL validation regex
const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&[\w=]*)?$/;

export const workoutSchema = z.object({
  youtubeUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === '' || YOUTUBE_URL_REGEX.test(val), {
      message: 'Please enter a valid YouTube URL',
    }),
});

export type WorkoutFormData = z.infer<typeof workoutSchema>;
