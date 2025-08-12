// src/components/auth/LoginForm.tsx
// version: "2.0.0", // Update version due to significant changes
// quick description: Login form component for user authentication using react-hook-form and NextAuth.js
// CAUTION: Always leave quick description at the top of the file each time update
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter từ next/navigation
import { signIn } from 'next-auth/react'; // Import hàm signIn từ NextAuth.js
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { loginSchema } from '@/lib/validators/userSchema'; // Import schema đã update
// import { LoginFormInputs } from '@/types/auth'; // Không cần thiết khi dùng z.infer
import s from './styles/LoginForm.module.css';
import c from 'clsx';

export default function LoginForm() {
  const router = useRouter(); // Khởi tạo router để điều hướng

  // Sử dụng infer để lấy type từ Zod schema, đảm bảo đồng bộ
  type LoginFormSchema = z.infer<typeof loginSchema>;

  const {
    register, // Hàm để đăng ký input
    handleSubmit, // Hàm xử lý submit form
    formState: { errors, isSubmitting }, // Trạng thái form: lỗi và đang submit
    // setError, // Có thể dùng để set lỗi thủ công từ server, nhưng NextAuth.js trả về lỗi chung
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema), // Tích hợp Zod validation
    defaultValues: { // Thiết lập giá trị mặc định cho form
      email: '',
      password: '',
    },
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (data: LoginFormSchema) => {
    setMessage(null); // Xóa thông báo cũ

    try {
      // Gọi hàm signIn của NextAuth.js
      // 'credentials' là ID của provider bạn đã cấu hình trong authOptions
      // redirect: false để NextAuth.js không tự động chuyển hướng và chúng ta có thể xử lý phản hồi
      const result = await signIn('credentials', {
        redirect: false, // Quan trọng: Tắt tự động redirect của NextAuth.js
        email: data.email,
        password: data.password,
        // callbackUrl: '/dashboard' // Tùy chọn: URL để redirect sau khi đăng nhập thành công nếu redirect: true
      });

      if (result?.error) {
        // Nếu có lỗi từ server (ví dụ: "Invalid credentials." từ hàm authorize)
        setMessage({ type: 'error', text: result.error });
      } else if (result?.ok) {
        // Nếu đăng nhập thành công
        setMessage({ type: 'success', text: 'Đăng nhập thành công! Đang chuyển hướng...' });
        // Chuyển hướng người dùng đến trang dashboard hoặc trang chính
        router.push('/'); // Hoặc '/'
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    }
    // `isSubmitting` từ react-hook-form sẽ tự động quản lý trạng thái loading
    // Không cần finally block với setLoading(false) nữa
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s["auth-from"]}>
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
          placeholder="Email của bạn"
          {...register('email')} // Đăng ký trường 'email' với react-hook-form
        />
        {errors.email && (
          <p className={s["error-message"]}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={s["form-group"]}>
        <label htmlFor="password">Mật khẩu</label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          {...register('password')} // Đăng ký trường 'password'
        />
        {errors.password && (
          <p className={s["error-message"]}>
            {errors.password.message}
          </p>
        )}
      </div>

      <div className={s["form-link"]}>
        <Link href="/auth/forgot-password" className={s["link-text"]}>Quên mật khẩu?</Link>
      </div>

      <button type="submit" className={s["submit-button"]} disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>

      <div className={s["form-footer"]}>
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className={s["link-text"]}>Đăng ký ngay</Link>
      </div>
    </form>
  );
}