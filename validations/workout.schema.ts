import { z } from 'zod';

// YouTube URL validation regex
const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&[\w=]*)?$/;

export const workoutSchema = z
  .object({
    name: z.string().min(1, 'Please enter workout name'),
    description: z.string().optional(),
    durationMinutes: z.number().min(1, 'Please enter a valid duration'),
    assignedToPositions: z.array(z.string()).optional(),
    difficultyLevel: z.string().optional(),
    equipmentNeededInput: z.string().optional(),
    scheduledDate: z.string().optional(),
    youtubeUrl: z
      .string()
      .optional()
      .refine((val) => !val || val.trim() === '' || YOUTUBE_URL_REGEX.test(val), {
        message: 'Please enter a valid YouTube URL',
      }),
    positionSpecific: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.positionSpecific &&
      (!data.assignedToPositions || data.assignedToPositions.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one position',
        path: ['assignedToPositions'],
      });
    }
  });

export type WorkoutFormData = z.infer<typeof workoutSchema>;
