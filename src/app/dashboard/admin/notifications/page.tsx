'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  message,
  Radio,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  BellOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'NOTI' | 'BANNER';
  isPublic: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

const NotificationsManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [form] = Form.useForm();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { data: session } = useSession();
  const router = useRouter();

  // Check if the user is an admin
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      message.error('You do not have permission to access this page');
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      // Combine both types of notifications into a single array
      const allNotifications = [
        ...(data.banners || []), 
        ...(data.notifications || [])
      ];
      
      setNotifications(allNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      message.success('Notification deleted successfully');
      // Refresh notifications after deletion
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Failed to delete notification');
    }
  };

  const showModal = (notification?: Notification) => {
    form.resetFields();
    
    if (notification) {
      // Edit mode
      setIsEditMode(true);
      setCurrentNotification(notification);
      form.setFieldsValue({
        title: notification.title,
        content: notification.content,
        type: notification.type,
        isPublic: notification.isPublic,
        userId: notification.userId,
      });
    } else {
      // Create mode
      setIsEditMode(false);
      setCurrentNotification(null);
      form.setFieldsValue({
        type: 'NOTI',
        isPublic: true
      });
    }
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isEditMode && currentNotification) {
        // Update existing notification
        const response = await fetch(`/api/notifications`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: currentNotification.id,
            ...values
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update notification');
        }

        message.success('Notification updated successfully');
      } else {
        // Create new notification
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Failed to create notification');
        }

        message.success('Notification created successfully');
      }

      setIsModalVisible(false);
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      message.error('Failed to save notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchText.toLowerCase()) ||
    notification.type.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: Notification, b: Notification) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'BANNER' ? 'blue' : 'green';
        return <Tag color={color}>{type}</Tag>;
      },
      filters: [
        { text: 'BANNER', value: 'BANNER' },
        { text: 'NOTI', value: 'NOTI' },
      ],
      onFilter: (value: boolean | React.Key, record: Notification) => record.type === value,
    },
    {
      title: 'Visibility',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean) => (
        <Tooltip title={isPublic ? 'Visible to everyone' : 'Specific users only'}>
          <Space>
            {isPublic ? <GlobalOutlined /> : <UserOutlined />}
            <span>{isPublic ? 'Public' : 'Private'}</span>
          </Space>
        </Tooltip>
      ),
      filters: [
        { text: 'Public', value: true },
        { text: 'Private', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: Notification) => record.isPublic === value,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Notification, b: Notification) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Notification, b: Notification) => 
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Notification) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => {
              Modal.info({
                title: record.title,
                content: (
                  <div>
                    <p>{record.content}</p>
                    <p style={{ marginTop: 16 }}>
                      <strong>Type:</strong> {record.type}<br />
                      <strong>Visibility:</strong> {record.isPublic ? 'Public' : 'Private'}<br />
                      <strong>Created:</strong> {new Date(record.createdAt).toLocaleString()}<br />
                      <strong>Updated:</strong> {new Date(record.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ),
                width: 500,
              });
            }}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Delete notification"
            description="Are you sure you want to delete this notification?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Notifications Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Create Notification
        </Button>
      </div>

      <Card className="mb-6">
        <div className="mb-4">
          <Input
            placeholder="Search notifications..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredNotifications}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <p style={{ margin: 0 }}>
                <strong>Content:</strong> {record.content}
              </p>
            ),
          }}
        />
      </Card>

      <Modal
        title={isEditMode ? "Edit Notification" : "Create New Notification"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'NOTI',
            isPublic: true
          }}
        >
          <Form.Item
            name="title"
            label="Notification Title"
            rules={[{ required: true, message: 'Please enter notification title' }]}
          >
            <Input placeholder="Enter notification title" prefix={<BellOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Notification Content"
            rules={[{ required: true, message: 'Please enter notification content' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter detailed notification content" 
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Notification Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="NOTI">NOTI (Regular notification)</Select.Option>
              <Select.Option value="BANNER">BANNER (Featured announcement)</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isPublic"
            label="Visibility"
            valuePropName="checked"
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={true}>
                  <Space>
                    <GlobalOutlined /> Public (Visible to everyone)
                  </Space>
                </Radio>
                <Radio value={false}>
                  <Space>
                    <UserOutlined /> Private (Specific users only)
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {!form.getFieldValue('isPublic') && (
            <Form.Item
              name="userId"
              label="Target User ID"
              rules={[{ required: !form.getFieldValue('isPublic'), message: 'Please enter user ID' }]}
            >
              <Input placeholder="Enter specific user ID" />
            </Form.Item>
          )}

          <Form.Item>
            <div className="flex justify-end">
              <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {isEditMode ? "Update" : "Create"} Notification
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsManagement;