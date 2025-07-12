// src/components/home/NotificationBox.tsx
import React from 'react';

interface Notification {
  id: number;
  message: string;
}

const notifications: Notification[] = [
  { id: 1, message: 'Hệ thống đã được cập nhật phiên bản mới nhất.' },
  { id: 2, message: 'Tài liệu "Báo cáo tài chính Q2/2024" đã được thêm.' },
  { id: 3, message: 'Thông báo bảo trì hệ thống vào lúc 23:00 ngày 20/07/2024.' },
  { id: 4, message: 'Chức năng tìm kiếm nâng cao đã được kích hoạt.' },
  { id: 5, message: 'Tài liệu hướng dẫn sử dụng mới đã có sẵn.' },
  { id: 6, message: 'Vui lòng xác nhận email để kích hoạt tài khoản.' },
  { id: 7, message: 'Đăng ký thành công khóa học "Quản lý dữ liệu lớn".' },
];

export default function NotificationBox() {
  return (
    <div className="notification-box">
      <h3>This is an example notification</h3>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
}