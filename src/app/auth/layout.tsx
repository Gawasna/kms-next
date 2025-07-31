'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const TITLE_BY_PATH: Record<string, string> = {
  '/auth/login': 'Chào mừng bạn trở lại!',
  '/auth/register': 'Đăng ký tài khoản',
  '/auth/forgot': 'Quên mật khẩu?',
  '/auth/reset': 'Đặt lại mật khẩu',
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const title = TITLE_BY_PATH[pathname];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            KIMS
          </Link>

          {pathname !== '/auth/verify' && title && (
            <h1 className="auth-title">{title}</h1>
          )}
        </div>

        <div className="auth-content">
          {children || <p>Không có nội dung nào được truyền vào.</p>}
        </div>
      </div>
    </div>
  );
}
