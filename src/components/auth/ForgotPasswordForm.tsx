// src/components/auth/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/lib/validators/userSchema';
import { ForgotPasswordFormInputs } from '@/types/auth';

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormInputs>({ email: '' });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => prev.filter(err => err.path[0] !== e.target.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setMessage(null);

    try {
      forgotPasswordSchema.parse(formData);

      console.log('Forgot password form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Simulate success
      setMessage({ type: 'success', text: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!' });
      setFormData({ email: '' }); // Clear form

    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.errors);
        setMessage({ type: 'error', text: 'Vui lòng kiểm tra lại email.' });
      } else {
        setMessage({ type: 'error', text: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        console.error('Forgot password error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="form-title">Quên Mật Khẩu</h2>
      <p className="form-description">
        Vui lòng nhập email của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
      </p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="forgot-email">Email</label>
        <input
          type="email"
          id="forgot-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@example.com"
          required
        />
        {errors.find(err => err.path[0] === 'email') && (
          <p className="error-message">
            {errors.find(err => err.path[0] === 'email')?.message}
          </p>
        )}
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
      </button>

      <div className="form-footer">
        <Link href="/auth/login" className="link-text">← Quay lại Đăng nhập</Link>
      </div>
    </form>
  );
}