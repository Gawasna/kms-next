// src/components/home/HeroSlider.tsx
'use client'; // Client Component vì có tương tác với Carousel

import React from 'react';
import { Carousel } from 'antd';
import Image from 'next/image';

// Import CSS Module
import styles from './styles/HeroSlider.module.css';

interface Slide {
  id: number;
  src: string;
  alt: string;
}

const slides: Slide[] = [
  { id: 1, src: 'https://placehold.co/800x600/FF5733/FFFFFF?text=KIMS+Slide+1', alt: 'KIMS Slider Image 1' },
  { id: 2, src: 'https://placehold.co/800x600/33FF57/FFFFFF?text=KIMS+Slide+2', alt: 'KIMS Slider Image 2' },
  { id: 3, src: 'https://placehold.co/800x600/3357FF/FFFFFF?text=KIMS+Slide+3', alt: 'KIMS Slider Image 3' },
  { id: 4, src: 'https://placehold.co/800x600/FF33E0/FFFFFF?text=KIMS+Slide+4', alt: 'KIMS Slider Image 4' },
];

export default function HeroSlider() {
  return (
    <div className={styles.heroSliderContainer}> {/* Áp dụng class container */}
      <Carousel
        autoplay // Tự động chuyển slide
        autoplaySpeed={5000} // Thời gian chuyển slide (5 giây)
        arrows={true} // Hiển thị mũi tên điều hướng
        dotPosition="bottom" // Vị trí của các dấu chấm chỉ thị
        infinite={true} // Vòng lặp vô hạn
      >
        {slides.map(slide => (
          <div key={slide.id} className={styles.heroSlideItem}> {/* Áp dụng class item */}
            <Image
              src={slide.src}
              alt={slide.alt}
              width={800}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              priority={slide.id === 1}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}