'use client';

import React, { useState } from 'react';
import { Input, Select, DatePicker, Tag, Typography, Form, Divider } from 'antd';
import type { FormInstance } from 'antd';

const { TextArea } = Input;
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

  return (
    <div className="mt-4 p-4 border-t">
      <Text strong>Chia sẻ với sinh viên cụ thể</Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
        Để trống nếu muốn chia sẻ với tất cả sinh viên. Nhập danh sách email, phân cách bằng dấu phẩy (,), chấm phẩy (;), khoảng trắng hoặc xuống dòng.
      </Text>

      <Form.Item 
        name="specificEmails" 
        rules={[
          {
            validator: async (_, value) => {
              if (!value) return Promise.resolve();
              
              // Nếu là string (người dùng nhập text area), thì parse thành mảng
              let emailsToCheck = value;
              if (typeof value === 'string') {
                // Tách chuỗi thành mảng email dựa trên dấu phẩy, chấm phẩy, khoảng trắng, xuống dòng
                emailsToCheck = value
                  .split(/[\s,;]+/)
                  .map(e => e.trim())
                  .filter(e => e); // Loại bỏ chuỗi rỗng
              }

              // Nếu không có email nào để xử lý
              if (!emailsToCheck.length) return Promise.resolve();
              
              // Regex kiểm tra email
              const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/;
              
              // Tách thành email hợp lệ và không hợp lệ
              const validEmails = [];
              const invalidEmails = [];
              
              for (const email of emailsToCheck) {
                if (emailRegex.test(email)) {
                  validEmails.push(email.toLowerCase());
                } else if (email) {
                  invalidEmails.push(email);
                }
              }
              
              // Cập nhật giá trị trong form thành mảng email đã được validate
              form.setFieldValue('specificEmails', [...new Set(validEmails)]);
              
              // Nếu có email không hợp lệ thì trả về lỗi
              if (invalidEmails.length > 0) {
                return Promise.reject(`Email không hợp lệ: ${invalidEmails.join(', ')}`);
              }
              
              return Promise.resolve();
            },
          },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Ví dụ: student1@example.com, student2@example.com"
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