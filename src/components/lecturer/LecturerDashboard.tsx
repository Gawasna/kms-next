'use client'

import { useState } from 'react';
import { Card, Tabs, Typography, Alert, Space } from 'antd';
import { FileOutlined, UserOutlined, TeamOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { Session } from 'next-auth';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function LecturerDashboard({ session }: { session: Session }) {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="p-6">
      <Title level={3}>Welcome, {session.user.name}</Title>
      <Text type="secondary">Lecturer Dashboard</Text>
      
      <Alert
        message="Prototype Dashboard"
        description="Bảng điều khiển hiện đang trong quá trình phát triển."
        type="info"
        showIcon
        banner
        className="my-4"
      />

    </div>
  );
}