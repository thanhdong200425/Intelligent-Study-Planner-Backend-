import { title } from 'process';
import z from 'zod';

export const ExtractedTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  estimateMinutes: z
    .number()
    .min(1, 'Estimate must be at least 1 minute')
    .max(1440, 'Estimate must be less than 1440 minutes')
    .optional(),
  type: z
    .enum(['reading', 'coding', 'writing', 'pset', 'other'])
    .optional()
    .default('other'),
});

export const TaskArraySchema = z.object({
  tasks: z
    .array(ExtractedTaskSchema)
    .describe('Array of extracted tasks from the image'),
});

export type TaskArray = z.infer<typeof TaskArraySchema>;
export type ExtractedTask = z.infer<typeof ExtractedTaskSchema>;
