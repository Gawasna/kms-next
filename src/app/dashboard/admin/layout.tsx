'use client';

import React from 'react';
import { Breadcrumb, Button, Dropdown, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileOutlined,
  BookOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  const adminNavigationItems = [
    {
      key: '/dashboard/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/admin">Dashboard</Link>,
    },
    {
      key: '/dashboard/admin/users',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/admin/users">Users</Link>,
    },
    {
      key: '/dashboard/admin/documents',
      icon: <FileOutlined />,
      label: <Link href="/dashboard/admin/documents">Documents</Link>,
    },
    {
      key: '/dashboard/admin/notifications',
      icon: <BellOutlined />,
      label: <Link href="/dashboard/admin/notifications">Notifications</Link>,
    },
    {
      key: '/dashboard/admin/tags',
      icon: <LogoutOutlined />,
      label: <Link href="/dashboard/admin/tags">Tags</Link>,
    },
    {
      key: '/dashboard/admin/categories',
      icon: <BookOutlined />,
      label: <Link href="/dashboard/admin/categories">Categories</Link>,
    }
  ];

  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    return [
      { title: <Link href="/">Home</Link> },
      ...paths.map((path, index) => {
        const url = `/${paths.slice(0, index + 1).join('/')}`;
        return {
          title: <Link href={url}>{path.charAt(0).toUpperCase() + path.slice(1)}</Link>,
        };
      }),
    ];
  };

  return (
    <div className="admin-layout">
      {/* Sub navigation menu for Admin section */}
      <div className="admin-sub-nav">
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={adminNavigationItems}
        />
      </div>
      
      {/* Admin content area */}
      <div className="admin-content">
        <div className="admin-content-header">
          {/**
           * add something like a breadcrumb or page title here
           */}
        </div>
        
        <div className="admin-content-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;