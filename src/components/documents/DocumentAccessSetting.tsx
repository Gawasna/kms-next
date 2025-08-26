'use client';

import React from 'react';
import { FormInstance, Radio, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { AccessLevel } from '@prisma/client';
import { SpecificShareSetting } from './SpecificShareSetting';

// Props mà Form.Item của Ant Design sẽ truyền vào
interface DocumentAccessSettingProps {
  value?: AccessLevel;
  onChange?: (accessLevel: AccessLevel) => void;
  form: FormInstance;
  currentAccessLevel?: AccessLevel; // Thêm prop mới
}

export function DocumentAccessSetting({ value = 'PRIVATE', onChange, form, currentAccessLevel }: DocumentAccessSettingProps) {
  const handleChange = (e: any) => {
    const newValue: AccessLevel = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const accessOptions: { value: AccessLevel; label: string; description: string }[] = [
    { value: 'PUBLIC', label: 'Công khai', description: 'Mọi người đều có thể xem.' },
    { value: 'STUDENT_ONLY', label: 'Chỉ Sinh viên', description: 'Sinh viên, Giảng viên, Admin có thể xem.' },
    { value: 'LECTURER_ONLY', label: 'Chỉ Giảng viên', description: 'Chỉ Giảng viên và Admin có thể xem.' },
    { value: 'PRIVATE', label: 'Riêng tư', description: 'Chỉ bạn và Admin có thể xem.' }
  ];

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Thiết lập Chia sẻ</h3>
      <Radio.Group onChange={handleChange} value={value} className="w-full">
        <Space direction="vertical" className="w-full">
          {accessOptions.map((option) => (
            <div key={option.value} className="flex items-center justify-between w-full py-2 px-3 border rounded-md mb-2">
              <Radio value={option.value} className="flex-grow">
                {option.label}
              </Radio>
              <Tooltip title={option.description}>
                <InfoCircleOutlined className="text-gray-400 cursor-help" />
              </Tooltip>
            </div>
          ))}
        </Space>
      </Radio.Group>

      {currentAccessLevel === 'STUDENT_ONLY' && <SpecificShareSetting form={form} />}
    </div>
  );
}