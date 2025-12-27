import { z } from 'zod';

// Video file URI validation - accepts file:// URIs and content:// URIs from device
const VIDEO_URI_REGEX =
  /^(file:\/\/|content:\/\/|ph:\/\/|assets-library:\/\/).+\.(mp4|mov|avi|mkv|m4v)$/i;

export const personalRecordSchema = z.object({
  videoUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === '' || VIDEO_URI_REGEX.test(val), {
      message: 'Please select a valid video file',
    }),
});

export type PersonalRecordFormData = z.infer<typeof personalRecordSchema>;
