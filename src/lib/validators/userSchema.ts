// src/lib/validators/userSchema.ts
// version: "1.0.0",
// quick description: Zod schemas for user authentication forms in a Next.js application
// CAUTION: Always leave quick description at the top of the file each time update

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống.'), // Thêm validation cho name
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp.',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
});