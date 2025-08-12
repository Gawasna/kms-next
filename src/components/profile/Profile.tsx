'use client';

import React, { useState, useRef } from 'react';
import { Avatar, Button, Card, Form, Input, message, Spin, Upload } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Định nghĩa kiểu dữ liệu người dùng cho props
type UserProfileProps = {
  initialUser: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
};

export default function UserProfile({ initialUser }: UserProfileProps) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Khởi tạo router
  const { update } = useSession();

  // Xử lý sự kiện tải lên avatar
  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    setLoading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message || 'Cập nhật avatar thành công!');
        
        // 1. Cập nhật JWT bằng cách gọi `update`
        // Dữ liệu bạn truyền vào đây sẽ được gửi đến `jwt` callback ở server
        await update({ image: result.newAvatarUrl });
        
        // 2. Cập nhật state local để UI thay đổi ngay lập tức
        setUser((prev) => ({ ...prev, image: result.newAvatarUrl }));

        if (onSuccess) onSuccess('Ok');
      } else {
        message.error(result.message || 'Lỗi khi tải lên avatar.');
        if (onError) onError(new Error(result.message));
      }
    } catch (error) {
      message.error('Đã có lỗi không mong muốn xảy ra.');
      if (onError) onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa avatar
  const handleDeleteAvatar = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/profile/upload-avatar', {
            method: 'DELETE',
        });
        const result = await response.json();
        if(response.ok) {
            message.success(result.message || 'Xóa ảnh đại diện thành công!');
            setUser(prev => ({ ...prev, image: null }));
            router.refresh();
        } else {
            message.error(result.message || 'Lỗi khi xóa ảnh đại diện.');
        }
    } catch (error) {
        message.error('Đã xảy ra lỗi không mong muốn.');
    } finally {
        setLoading(false);
    }
  }

  // Xử lý cập nhật tên
  const handleUpdateName = async (values: { name: string }) => {
    setLoading(true);
    // TODO: Triển khai API /api/profile/update-name
    // Sau khi thành công, cũng gọi router.refresh()
    console.log('Updating name:', values);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập API call
    setUser((prev) => ({ ...prev, name: values.name }));
    message.success('Cập nhật tên thành công!');
    setLoading(false);
    router.refresh();
  };

  return (
    <Spin spinning={loading}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Avatar và các nút thao tác */}
          <div style={{ textAlign: 'center' }}>
            <Avatar size={128} src={user.image} icon={<UserOutlined />} />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Upload
                customRequest={handleAvatarUpload}
                showUploadList={false}
                accept="image/png, image/jpeg, image/webp"
              >
                <Button icon={<UploadOutlined />}>Tải lên</Button>
              </Upload>
              {user.image && (
                 <Button icon={<DeleteOutlined />} onClick={handleDeleteAvatar} danger>Xóa</Button>
              )}
            </div>
          </div>

          {/* Form thông tin người dùng */}
          <div style={{ flex: 1 }}>
            <Form
              layout="vertical"
              initialValues={{ name: user.name, email: user.email }}
              onFinish={handleUpdateName}
            >
              <Form.Item label="Email">
                <Input value={user.email || 'N/A'} disabled />
              </Form.Item>

              <Form.Item
                label="Tên hiển thị"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
              >
                <Input placeholder="Tên của bạn" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                  Cập nhật tên
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </Spin>
  );
}