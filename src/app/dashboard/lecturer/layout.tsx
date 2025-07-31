'use client';

import React from 'react';
import { Breadcrumb, Tabs } from 'antd';
import { BookOutlined, BarChartOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
  
  const getLecturerTab = () => {
    if (pathname.includes('/dashboard/lecturer/documents')) {
      return 'documents';
    }
    if (pathname.includes('/dashboard/lecturer/stats')) {
      return 'stats';
    }
    return 'overview';
  };

  return (
    <div className="lecturer-layout">
      <Breadcrumb style={{ marginBottom: '16px' }} items={getBreadcrumbItems()} />
      
      <Tabs 
        activeKey={getLecturerTab()}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: null,
          },
          {
            key: 'documents',
            label: <><BookOutlined /> My Documents</>,
            children: null,
          },
          {
            key: 'stats',
            label: <><BarChartOutlined /> Statistics</>,
            children: null,
          },
        ]}
        onChange={(key) => {
          if (key === 'documents') {
            window.location.href = '/dashboard/lecturer/documents';
          } else if (key === 'stats') {
            window.location.href = '/dashboard/lecturer/stats';
          } else {
            window.location.href = '/dashboard/lecturer';
          }
        }}
      />
      
      <div className="lecturer-content">
        {children}
      </div>
    </div>
  );
}
