// src/app/auth/forgot-password/page.tsx
// version: "1.0.0",
// quick description: Page for users to reset their password in a Next.js application
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu - KIMS',
  description: 'Đặt lại mật khẩu cho tài khoản KIMS của bạn',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}