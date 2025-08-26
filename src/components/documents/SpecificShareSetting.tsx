// src/components/documents/SpecificShareSetting.tsx
'use client';

import React, { useState } from 'react';
import { Input, Select, DatePicker, Tag, Typography, Alert, Form, Divider } from 'antd';
import type { FormInstance } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface SpecificShareSettingProps {
  form: FormInstance; // Nhận form instance để set giá trị
}

// Regex để parse email
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

export function SpecificShareSetting({ form }: SpecificShareSettingProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [deadlineOption, setDeadlineOption] = useState<string>('none');

  // Hàm parse và validate email từ TextArea
  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const rawEmails = text.match(emailRegex) || [];
    const uniqueEmails = [...new Set(rawEmails.map(email => email.toLowerCase()))];
    
    // Tìm các email không hợp lệ (phần còn lại sau khi trích xuất)
    const invalidParts = text.replace(/[\s,;]+/g, ' ').split(' ').filter(part => part && !emailRegex.test(part));
    setInvalidEmails(invalidParts);
    setEmails(uniqueEmails);
    
    // Cập nhật giá trị cho Ant Design Form
    form.setFieldValue('specificEmails', uniqueEmails);
  };

  // Xử lý thay đổi thời hạn
  const handleDeadlineChange = (value: string) => {
    setDeadlineOption(value);
    form.setFieldValue('deadlineOption', value);
    if (value !== 'custom') {
      form.setFieldValue('customDeadline', null);
    }
  };

  return (
    <div className="mt-4 p-4 border-t">
      <Text strong>Chia sẻ với sinh viên cụ thể</Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
        Để trống nếu muốn chia sẻ với tất cả sinh viên.
      </Text>

      <Form.Item name="specificEmails" noStyle>
        <TextArea
          rows={4}
          placeholder="Nhập danh sách email, phân tách bằng dấu phẩy, khoảng trắng hoặc xuống dòng..."
          onChange={handleEmailChange}
        />
      </Form.Item>
      
      {invalidEmails.length > 0 && (
        <Alert
          message={`Các mục sau không phải là email hợp lệ và đã bị bỏ qua: ${invalidEmails.join(', ')}`}
          type="warning"
          showIcon
          style={{ marginTop: '8px' }}
        />
      )}
      
      <div className="mt-2">
        {emails.map(email => (
          <Tag key={email} closable onClose={() => setEmails(emails.filter(e => e !== email))}>
            {email}
          </Tag>
        ))}
      </div>
      
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