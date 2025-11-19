// src/schemas/board.schema.ts
import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Tiêu đề là bắt buộc' }),
  }),
});