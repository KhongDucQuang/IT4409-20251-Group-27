// src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Tên là bắt buộc' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(1, { message: 'Mật khẩu là bắt buộc' }),
  }),
});