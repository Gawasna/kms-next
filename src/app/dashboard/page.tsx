// Dashboard page for authenticated users
// Added: 2025-07-02 - Basic dashboard page prototype

'use client';
import React from 'react';
import { Layout, Typography, Button } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', color: 'white', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>KIMS Dashboard</div>
        <Button type="primary" ghost onClick={handleLogout}>
          Logout
        </Button>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Title level={2}>Welcome to the Dashboard</Title>
        <p>Hello, {user?.username || 'User'}!</p>
        <p>This is a prototype dashboard page. You have successfully logged in.</p>
      </Content>
    </Layout>
  );
}
