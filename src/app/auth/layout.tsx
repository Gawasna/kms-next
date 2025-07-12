// src/app/auth/layout.tsx
import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            KIMS
          </Link>
          <h1 className="auth-title">Chào mừng bạn trở lại!</h1>
        </div>
        <div className="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
}