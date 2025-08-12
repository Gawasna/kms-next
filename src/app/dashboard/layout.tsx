'use client';

import React from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = React.useState(false);
    const pathname = usePathname();
    const {
        data: session,
        status
    } = useSession();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} 
                  style={{ 
                      overflow: 'auto', 
                      height: '100vh', 
                      position: 'fixed',
                      left: 0,
                      top: 0,
                      bottom: 0,
                  }}>
                <div className="logo" style={{ 
                    height: '64px', 
                    margin: '16px', 
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '20px'
                }}>
                    {collapsed ? 'K' : 'KIMS'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[pathname]}
                    items={[
                        {
                            key: '/dashboard',
                            icon: <DashboardOutlined />,
                            label: <Link href="/dashboard">Dashboard</Link>,
                        },
                        {
                            key: '/dashboard/documents',
                            icon: <UserOutlined />,
                            label: <Link href="/dashboard/documents">Documents</Link>,
                        },
                    ]}
                />
            </Sider>
            <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <div>
                            <Avatar icon={<UserOutlined />} />
                            <span style={{ marginLeft: 8 }}>
                                {session ? session.user.name : 'Lỗi Hiển Thị'}
                            </span>
                        </div>
                    </div>
                </Header>
                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: '#fff',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}