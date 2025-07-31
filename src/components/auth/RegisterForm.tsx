// version: "1.0.0",
// quick description: Registration form component for user sign-up in a Next.js application
// CAUTION: Always leave quick description at the top of the file each time update
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { registerSchema } from '@/lib/validators/userSchema';
import { RegisterFormInputs } from '@/types/auth';
import s from './styles/LoginForm.module.css';
import c from 'clsx';

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormInputs>({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => prev.filter(err => err.path[0] !== e.target.name && err.path[0] !== 'confirmPassword'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setMessage(null);

    try {
      registerSchema.parse(formData);

      console.log('Register form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage({ type: 'success', text: 'Đăng ký thành công! Vui lòng đăng nhập.' });
      setFormData({ email: '', password: '', confirmPassword: '' });

    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors);
        setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại thông tin đăng ký.' });
      } else {
        setMessage({ type: 'error', text: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        console.error('Registration error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={s["auth-from"]}>
      <h2 className={s["form-title"]}>Đăng Ký</h2>

      {message && (
        <div className={c(s.message, s[message.type])}>
          {message.text}
        </div>
      )}

      <div className={s["form-group"]}>
        <label htmlFor="register-email">Email</label>
        <input
          type="email"
          id="register-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@example.com"
          required
        />
        {errors.find(err => err.path[0] === 'email') && (
          <p className={s["error-message"]}>
            {errors.find(err => err.path[0] === 'email')?.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="register-password">Mật khẩu</label>
        <input
          type="password"
          id="register-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          pattern=".{8,}"
          title="Mật khẩu phải có ít nhất 8 ký tự"
        />
        {errors.find(err => err.path[0] === 'password') && (
          <p className={s["error-message"]}>
            {errors.find(err => err.path[0] === 'password')?.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
        <input
          type="password"
          id="confirm-password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {errors.find(err => err.path[0] === 'confirmPassword') && (
          <p className={s["error-message"]}>
            {errors.find(err => err.path[0] === 'confirmPassword')?.message}
          </p>
        )}
      </div>

      <button type="submit" className={s["submit-button"]} disabled={loading}>
        {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
      </button>

      <div className={s["form-footer"]}>
        Đã có tài khoản?{' '}
        <Link href="/auth/login" className={s["link-text"]}>Đăng nhập</Link>
      </div>
    </form>
  );
}