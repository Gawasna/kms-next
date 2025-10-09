'use client';
import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';

// Minimal theme configuration for faster loading
const theme = {
  token: {
    // Primary colors
    colorPrimary: '#1890ff',
    borderRadius: 6,
    // Reduce animation duration for faster perceived performance
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Layout: {
      // Updated to use new token names
      headerBg: '#001529',
      bodyBg: '#f0f2f5',
    },
    Form: {
      itemMarginBottom: 16,
    },
    Button: {
      controlHeight: 40,
    },
  },
};

interface AntdConfigProviderProps {
  children: ReactNode;
}

export default function AntdConfigProvider({ children }: AntdConfigProviderProps) {
  return (
    <ConfigProvider
      theme={theme}
      // Disable motion for faster rendering
      componentSize="middle"
    >
      <App>
      {children}
      </App>
    </ConfigProvider>
  );
}
