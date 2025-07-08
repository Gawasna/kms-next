// Auth layout component for authentication pages
// Fixed: 2025-07-02 - Removed missing component dependencies and simplified layout
// Fixed: 2025-07-02 - Added proper imports and created useAuth hook

'use client';
import React from 'react';
import { Layout } from 'antd';
import './layout.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AntdConfigProvider from '../../components/common/AntdConfigProvider';

const { Header, Content, Footer } = Layout;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard'); // Redirect to dashboard if authenticated
    }
  }, [isAuthenticated, router]);

  return (
    <AntdConfigProvider>
      <Layout className="auth-layout">
        <Header className="auth-header">
          <div className="auth-logo">KIMS Authentication</div>
        </Header>
        <Content className="auth-content">
          {children}
        </Content>
        <Footer className="auth-footer">
          KIMS ©2025 Created for authentication prototype
        </Footer>
      </Layout>
    </AntdConfigProvider>
  );
}