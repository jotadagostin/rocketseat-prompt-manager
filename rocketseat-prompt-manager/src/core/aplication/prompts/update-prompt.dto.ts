import z from 'zod';

export const updatePromptDtoSchema = z.object({
  id: z.string().min(1, 'Id is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export type UpdatePromptDTO = z.infer<typeof updatePromptDtoSchema>;
