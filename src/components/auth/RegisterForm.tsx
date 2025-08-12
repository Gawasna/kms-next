// src/components/auth/RegisterForm.tsx
// version: "2.0.0", // Update version due to significant changes
// quick description: Registration form component for user sign-up in a Next.js application using react-hook-form
// CAUTION: Always leave quick description at the top of the file each time update
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerSchema } from '@/lib/validators/userSchema'; // Import schema đã update
import { RegisterFormInputs } from '@/types/auth'; // Import interface đã update
import s from './styles/LoginForm.module.css'; // Đảm bảo đường dẫn CSS đúng
import c from 'clsx';

export default function RegisterForm() {
  type RegisterFormSchema = z.infer<typeof registerSchema>;

  const {
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema), 
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (data: RegisterFormSchema) => {
    setMessage(null);

    try {
      const { name, email, password } = data;

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Đăng ký thành công! Vui lòng đăng nhập.' });
        reset();
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
        
      } else {
        setMessage({ type: 'error', text: result.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s["auth-from"]}>
      <h2 className={s["form-title"]}>Đăng Ký</h2>

      {message && (
        <div className={c(s.message, s[message.type])}>
          {message.text}
        </div>
      )}

      <div className={s["form-group"]}>
        <label htmlFor="register-name">Tên của bạn</label>
        <input
          type="text"
          id="register-name"
          placeholder="Tên của bạn"
          {...register('name')} // Đăng ký trường 'name' với react-hook-form
        />
        {errors.name && (
          <p className={s["error-message"]}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="register-email">Email</label>
        <input
          type="email"
          id="register-email"
          placeholder="your@example.com"
          {...register('email')} // Đăng ký trường 'email'
        />
        {errors.email && (
          <p className={s["error-message"]}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="register-password">Mật khẩu</label>
        <input
          type="password"
          id="register-password"
          placeholder="••••••••"
          {...register('password')} 
        />
        {errors.password && (
          <p className={s["error-message"]}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
        <input
          type="password"
          id="confirm-password"
          placeholder="••••••••"
          {...register('confirmPassword')} // Đăng ký trường 'confirmPassword'
        />
        {errors.confirmPassword && (
          <p className={s["error-message"]}>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button type="submit" className={s["submit-button"]} disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng ký...' : 'Đăng Ký'}
      </button>

      <div className={s["form-footer"]}>
        Đã có tài khoản?{' '}
        <Link href="/auth/login" className={s["link-text"]}>Đăng nhập</Link>
      </div>
    </form>
  );
}