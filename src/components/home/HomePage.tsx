// src/components/home/HomePageContent.tsx
import React from 'react';
import HeroSlider from './HeroSlider';
import NotificationBox from './NotificationBox';
import BrowseSection from './BrowseSection';
import Link from 'next/link';
import './styles/Home.css';

const categories = [
  { name: 'Khoa học máy tính', count: 120, slug: 'khoa-hoc-may-tinh' },
  { name: 'Kinh tế & Quản lý', count: 95, slug: 'kinh-te-quan-ly' },
  { name: 'Nghệ thuật & Thiết kế', count: 60, slug: 'nghe-thuat-thiet-ke' },
  { name: 'Y học & Dược học', count: 80, slug: 'y-hoc-duoc-hoc' },
  { name: 'Kỹ thuật', count: 150, slug: 'ky-thuat' },
  { name: 'Luật', count: 45, slug: 'luat' },
  { name: 'Xã hội học', count: 70, slug: 'xa-hoi-hoc' },
];

const authors = [
  { name: 'Nguyễn Văn A', count: 25, slug: 'nguyen-van-a' },
  { name: 'Trần Thị B', count: 18, slug: 'tran-thi-b' },
  { name: 'Lê Văn C', count: 30, slug: 'le-van-c' },
  { name: 'Phạm Thị D', count: 12, slug: 'pham-thi-d' },
  { name: 'Hoàng Minh E', count: 20, slug: 'hoang-minh-e' },
  { name: 'Đỗ Thị F', count: 15, slug: 'do-thi-f' },
];

const tags = [
  { name: 'Big Data', count: 40, slug: 'big-data' },
  { name: 'AI', count: 55, slug: 'ai' },
  { name: 'Machine Learning', count: 30, slug: 'machine-learning' },
  { name: 'Blockchain', count: 20, slug: 'blockchain' },
  { name: 'Cloud Computing', count: 35, slug: 'cloud-computing' },
  { name: 'IoT', count: 28, slug: 'iot' },
];

const years = [
  { name: '2024', count: 150 },
  { name: '2023', count: 200 },
  { name: '2022', count: 180 },
  { name: '2021', count: 160 },
  { name: '2020', count: 140 },
  { name: '2019', count: 120 },
];

export default function HomePageContent() {
  return (
    <div className="homepage-main-content">
      <div className="hero-section-wrapper">
        <HeroSlider />
        <NotificationBox />
      </div>

      <section className="browse-sections-grid">
        <BrowseSection title="Các danh mục" items={categories} type="category" />
        <BrowseSection title="Duyệt theo tác giả" items={authors} type="author" />
        <BrowseSection title="Duyệt theo tag" items={tags} type="tag" />
        <BrowseSection title="Duyệt theo năm" items={years} type="year" />
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