'use client';

import React, { useState } from 'react';
import { Input, Select, DatePicker, Typography, Form, Divider, Spin } from 'antd';
import type { FormInstance } from 'antd';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface SpecificShareSettingProps {
  form: FormInstance;
}

export function SpecificShareSetting({ form }: SpecificShareSettingProps) {
  const [deadlineOption, setDeadlineOption] = useState<string>('none');

  // Xử lý thay đổi thời hạn
  const handleDeadlineChange = (value: string) => {
    setDeadlineOption(value);
    form.setFieldValue('deadlineOption', value);
    if (value !== 'custom') {
      form.setFieldValue('customDeadline', null);
    }
  };

  const emailValidator = (rule: any, value: string[]) => {
    if (!value || value.length === 0) {
      return Promise.resolve();
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/;
    const invalidEmails = value.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return Promise.reject(`Email không hợp lệ: ${invalidEmails.join(', ')}`);
    }
    return Promise.resolve();
  };

  return (
    <div className="mt-4 p-4 border-t">
      <Text strong>Chia sẻ với sinh viên cụ thể</Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
        Để trống nếu muốn chia sẻ với tất cả sinh viên. Nhập email và nhấn Enter, hoặc dán danh sách email (phân cách bằng dấu phẩy, chấm phẩy, khoảng trắng).
      </Text>

      <Form.Item 
        name="specificEmails" 
        rules={[{ validator: emailValidator }]}
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Ví dụ: student1@example.com"
          tokenSeparators={[',', ';', ' ', '\n']}
          notFoundContent={null}
          menuItemSelectedIcon={null}
        />
      </Form.Item>
      
      <Divider />
      
      <Text strong>Thiết lập thời hạn truy cập</Text>
      <Form.Item name="deadlineOption" noStyle initialValue="none">
        <Select value={deadlineOption} onChange={handleDeadlineChange} style={{ width: '100%', marginTop: '12px' }}>
          <Select.Option value="none">Không thời hạn</Select.Option>
          <Select.Option value="30d">30 ngày</Select.Option>
          <Select.Option value="60d">60 ngày</Select.Option>
          <Select.Option value="90d">90 ngày</Select.Option>
          <Select.Option value="custom">Tùy chỉnh ngày</Select.Option>
        </Select>
      </Form.Item>

      {deadlineOption === 'custom' && (
        <Form.Item name="customDeadline" style={{ marginTop: '12px' }}>
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
      )}
    </div>
  );
}