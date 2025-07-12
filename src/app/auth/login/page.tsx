// src/app/auth/login/page.tsx
// version: "1.0.0",
// quick description: Login page for user authentication in a Next.js application
// CAUTION: Always leave quick description at the top of the file each time update

import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập - KIMS',
  description: 'Đăng nhập vào hệ thống quản lý tài liệu KIMS',
};

export default function LoginPage() {
  return <LoginForm />;
}