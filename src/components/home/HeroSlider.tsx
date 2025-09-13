// src/components/home/HeroSlider.tsx
'use client';

import { Carousel } from 'antd';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import s from './styles/HeroSlider.module.css'; // Sử dụng CSS Module mới

// Định nghĩa kiểu dữ liệu cho mỗi slide
interface Slide {
  id: number | string;
  src: string;
  alt: string;
}

// Dữ liệu ảnh, có thể được truyền từ props trong tương lai
const slides: Slide[] = [
  { id: 1, src: '/images/MG_0798-1-e1700098574312.jpg', alt: 'KIMS Slider Image 1' },
  { id: 2, src: '/images/Rectangle-19765.png', alt: 'KIMS Slider Image 2' },
  { id: 3, src: '/images/thu-vien_2008093402.jpg', alt: 'KIMS Slider Image 3' },
  { id: 4, src: '/images/image.jpg', alt: 'KIMS Slider Image 4' },
];

export default function HeroSlider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hiển thị placeholder trong khi chờ mount để tránh lỗi hydration
  if (!mounted) {
    return <div className={s.carouselPlaceholder} />;
  }

  return (
    // Đổi tên class cho phù hợp với CSS mới, rõ ràng hơn
    <div className={s.carouselWrapper}>
      <Carousel
        autoplay={true}
        autoplaySpeed={5000}
        effect='fade'
        dots={true}
        arrows={true}
        className={s.carousel} // Class để định nghĩa aspect-ratio
      >
        {slides.map((slide, index) => (
          // Div này là slide của antd, chúng ta cần div con để chứa Image
          <div key={slide.id}>
             <div className={s.imageContainer}>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 800px" // Điều chỉnh sizes cho phù hợp
                  className={s.carouselImage}
                />
             </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}