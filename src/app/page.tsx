// src/app/page.tsx
// version: "1.0.0"
// quick description: Standard homepage for the KIMS application
// CAUTION: Always leave quick description at the top of the file each time update

import React from 'react';
import HomePageContent from '@/components/home/HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang Chủ',
  description: 'Chào mừng bạn đến với KIMS - Hệ thống quản lý tài liệu thông minh của bạn. Khám phá các tính năng mạnh mẽ để quản lý và tổ chức thông tin hiệu quả.',
  keywords: ['homepage', 'KIMS home', 'quản lý tài liệu', 'hệ thống thông tin', 'document management system'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'),
};

export default function HomePage() {
  return (
    <>
      {/* HomePageContent sẽ chứa toàn bộ nội dung chính của trang chủ, bao gồm slider, notification và các phần browse */}
      <HomePageContent />
    </>
  );
}