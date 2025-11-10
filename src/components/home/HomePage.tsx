// src/components/home/HomePageContent.tsx
import React from 'react';
import HeroSlider from './HeroSlider';
import NotificationBox from './NotificationBox';
import BrowseSection from './BrowseSection';
import Link from 'next/link';
import './styles/Home.css';
import { getBrowseData } from '@/lib/browse';

export default async function HomePageContent() {
  const browseData = await getBrowseData();

  return (
    <div className="homepage-main-content">
      <div className="hero-section-wrapper">
        <HeroSlider />
        <NotificationBox />
      </div>

      <section className="browse-sections-grid">
        <BrowseSection title="Các danh mục" items={browseData.categories} type="category" />
        <BrowseSection title="Duyệt theo tác giả" items={browseData.authors} type="author" />
        <BrowseSection title="Duyệt theo tag" items={browseData.tags} type="tag" />
        <BrowseSection title="Duyệt theo năm" items={browseData.years} type="year" />
      </section>

      {/* Có thể thêm các phần nội dung khác của trang chủ ở đây */}
      <section className="about-kims-section">
        <h2>Về KIMS</h2>
        <p>KIMS là hệ thống quản lý thông tin và tài liệu toàn diện, được thiết kế để giúp các tổ chức và cá nhân dễ dàng lưu trữ, tìm kiếm, và quản lý các loại tài liệu số hóa một cách hiệu quả. Với KIMS, bạn có thể tập trung vào công việc chính và để chúng tôi lo phần tổ chức dữ liệu.</p>
        <p>Khám phá thư viện số khổng lồ của chúng tôi, duyệt tìm theo nhiều tiêu chí khác nhau, và luôn cập nhật với các thông báo quan trọng từ hệ thống.</p>
        <Link href="/about" className="btn-secondary">Tìm hiểu thêm</Link>
      </section>
    </div>
  );
}
