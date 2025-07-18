// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { loginSchema } from '@/lib/validators/userSchema';
import { LoginFormInputs } from '@/types/auth';
import s from './styles/LoginForm.module.css';
import c from 'clsx'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormInputs>({ email: '', password: '' });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi cho trường hiện tại khi người dùng gõ
    setErrors(prev => prev.filter(err => err.path[0] !== e.target.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setMessage(null);

    try {
      // Validate data with Zod
      loginSchema.parse(formData);

      // Simulate API call
      console.log('Login form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Simulate success
      setMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });
      // In a real app, you would redirect here: router.push('/dashboard');

    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors);
        setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin đăng nhập.' });
      } else {
        setMessage({ type: 'error', text: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        console.error('Login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={s["auth-from"]}>
      <h2 className={s["form-title"]}>Đăng Nhập</h2>

      {message && (
        <div className={c(s.message, s[message.type])}>
          {message.text}
        </div>
      )}

      <div className={s["form-group"]}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email của bạn"
          required
        />
        {errors.find(err => err.path[0] === 'email') && (
          <p className={s["error-message"]}>
            {errors.find(err => err.path[0] === 'email')?.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="password">Mật khẩu</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {errors.find(err => err.path[0] === 'password') && (
          <p className={s["error-message"]}>
            {errors.find(err => err.path[0] === 'password')?.message}
          </p>
        )}
      </div>

      <div className={s["form-link"]}>
        <Link href="/auth/forgot-password" className={s["link-text"]}>Quên mật khẩu?</Link>
      </div>

      <button type="submit" className={s["submit-button"]} disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>

      <div className={s["form-footer"]}>
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className={s["link-text"]}>Đăng ký ngay</Link>
      </div>
    </form>
  );
}