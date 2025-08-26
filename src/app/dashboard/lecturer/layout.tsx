'use client';

import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  FileOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const LecturerLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  const lecturerNavigationItems = [
    {
      key: '/dashboard/lecturer',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/lecturer">Dashboard</Link>,
    },
    {
      key: '/dashboard/lecturer/documents',
      icon: <FileOutlined />,
      label: <Link href="/dashboard/lecturer/documents">Documents</Link>,
    },
    {
      key: '/dashboard/lecturer/students',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/lecturer/students">Students</Link>,
    },
  ];

  return (
    <div className="lecturer-layout">
      {/* Sub navigation menu for Lecturer section */}
      <div className="lecturer-sub-nav">
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={lecturerNavigationItems}
        />
      </div>
      
      {/* Lecturer content area */}
      <div className="lecturer-content">
        <div className="lecturer-content-header">
          {/* You can add breadcrumbs or page title here */}
        </div>
        
        <div className="lecturer-content-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LecturerLayout;