'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Avatar, Typography, Spin, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

// Setup dayjs
dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;

type ActiveUser = {
  id: string;
  name: string | null;
  email: string | null;
  lastActive: string;
  role: string;
  image: string | null;
};

type ActiveGuest = {
  id: string;
  lastActive: string;
};

type ActiveSessionsData = {
  activeUsers: ActiveUser[];
  activeGuests: ActiveGuest[];
  totalActive: number;
};

export default function ActiveSessions() {
  const [data, setData] = useState<ActiveSessionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/heartbeat');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
      setError('Không thể tải dữ liệu người dùng đang hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    
    // Cập nhật dữ liệu mỗi 30 giây
    const intervalId = setInterval(fetchActiveSessions, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const userColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text: string | null, record: ActiveUser) => (
        <div className="flex items-center">
          {record.image ? (
            <Avatar src={record.image} className="mr-2" />
          ) : (
            <Avatar icon={<UserOutlined />} className="mr-2" />
          )}
          <Text>{text || 'Không có tên'}</Text>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string | null) => text || 'N/A',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'blue';
        if (role === 'ADMIN') color = 'red';
        if (role === 'LECTURER') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Hoạt động',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (lastActive: string) => dayjs(lastActive).fromNow(),
    },
  ];

  const guestColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id.substring(0, 10)}...</Text>,
    },
    {
      title: 'Hoạt động',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (lastActive: string) => dayjs(lastActive).fromNow(),
    },
  ];

  if (error) {
    return (
      <Card>
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </Card>
    );
  }

  return (
    <Card title="Người dùng đang hoạt động" className="mb-6">
      {loading && !data ? (
        <div className="text-center py-4">
          <Spin />
          <div className="mt-2">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Text strong>
              Tổng số người dùng đang hoạt động: {data?.totalActive || 0}
            </Text>
          </div>

          <Title level={5}>Người dùng đăng nhập ({data?.activeUsers.length || 0})</Title>
          <Table 
            dataSource={data?.activeUsers || []} 
            columns={userColumns} 
            rowKey="id"
            pagination={false}
            className="mb-6"
            locale={{ emptyText: 'Không có người dùng đang hoạt động' }}
          />

          <Title level={5} className="mt-4">Khách vãng lai ({data?.activeGuests.length || 0})</Title>
          <Table 
            dataSource={data?.activeGuests || []} 
            columns={guestColumns} 
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Không có khách vãng lai đang hoạt động' }}
          />
        </>
      )}
    </Card>
  );
}