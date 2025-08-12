// src/components/documents/ShareSettingsForm.tsx
'use client'; // Đây có thể là Client Component vì có tương tác UI

import React from 'react';
import { Radio, Space, Typography, Alert } from 'antd';
import { AccessLevel } from '@/types/document'; // Import từ Prisma Schema của bạn (adjust path)

const { Text, Title } = Typography;

interface ShareSettingsFormProps {
  userRole: 'STUDENT' | 'LECTURER' | 'ADMIN'; // Vai trò của người dùng hiện tại
  onAccessLevelChange: (level: AccessLevel) => void;
  currentAccessLevel: AccessLevel; // Giá trị hiện tại của AccessLevel
}

export function ShareSettingsForm({
  userRole,
  onAccessLevelChange,
  currentAccessLevel,
}: ShareSettingsFormProps) {
  // Lấy danh sách các tùy chọn hiển thị dựa trên vai trò
  const getAccessLevelOptions = () => {
    if (userRole === 'LECTURER' || userRole === 'ADMIN') {
      return [
        { label: 'Công khai (Mọi người)', value: AccessLevel.PUBLIC },
        { label: 'Chỉ Sinh viên', value: AccessLevel.STUDENT_ONLY },
        { label: 'Chỉ Giảng viên', value: AccessLevel.LECTURER_ONLY },
        { label: 'Ẩn (Riêng tư)', value: AccessLevel.PRIVATE },
      ];
    }
    // Sinh viên và các vai trò khác (trong MVP, sinh viên không được chọn)
    return [
      { label: 'Chỉ Sinh viên (Mặc định)', value: AccessLevel.STUDENT_ONLY, disabled: true },
      // Hoặc nếu sinh viên được phép chọn nhưng sẽ chờ duyệt
      // { label: 'Công khai (Chờ duyệt)', value: AccessLevel.PUBLIC, disabled: false },
    ];
  };

  const options = getAccessLevelOptions();

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <Title level={4} className="mb-4 text-gray-800 dark:text-gray-100">
        Cài đặt Quyền truy cập
      </Title>
      <Text className="text-gray-600 dark:text-gray-300 mb-4 block">
        Chọn ai có thể xem tài liệu này sau khi được xuất bản.
      </Text>

      <Radio.Group onChange={(e) => onAccessLevelChange(e.target.value)} value={currentAccessLevel}>
        <Space direction="vertical">
          {options.map((option) => (
            <Radio key={option.value} value={option.value} disabled={true}>
              <Text className="text-gray-700 dark:text-gray-200">{option.label}</Text>
              {option.value === AccessLevel.PUBLIC && (
                <Text type="secondary" className="block text-sm">
                  (Hiển thị cho Khách, Sinh viên, Giảng viên, Admin)
                </Text>
              )}
              {option.value === AccessLevel.STUDENT_ONLY && (
                <Text type="secondary" className="block text-sm">
                  (Chỉ hiển thị cho Sinh viên, Giảng viên, Admin)
                </Text>
              )}
              {option.value === AccessLevel.LECTURER_ONLY && (
                <Text type="secondary" className="block text-sm">
                  (Chỉ hiển thị cho Giảng viên, Admin)
                </Text>
              )}
              {option.value === AccessLevel.PRIVATE && (
                <Text type="secondary" className="block text-sm">
                  (Chỉ hiển thị cho tác giả và Admin)
                </Text>
              )}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {userRole === 'STUDENT' && (
        <Alert
          message="Lưu ý quan trọng"
          description="Tài liệu của bạn sẽ được gửi đi chờ Admin/Kiểm duyệt viên duyệt trước khi được xuất bản và hiển thị theo quyền truy cập đã chọn (hoặc mặc định)."
          type="info"
          showIcon
          className="mt-6"
        />
      )}
    </div>
  );
}