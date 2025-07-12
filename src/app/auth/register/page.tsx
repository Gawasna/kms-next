// src/app/auth/register/page.tsx
// version: "1.0.0",  
// quick description: Registration page for new users in a Next.js application
// CAUTION: Always leave quick description at the top of the file each time update
import RegisterForm from '@/components/auth/RegisterForm';
import Header from '@/components/ui/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Ký - KIMS',
  description: 'Đăng ký tài khoản mới cho hệ thống quản lý tài liệu KIMS',
};

export default function RegisterPage() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}