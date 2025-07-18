// src/components/home/HeroSlider.tsx
'use client';
import React from 'react';
import { Carousel } from 'antd';
import Image from 'next/image';
import s from './styles/HeroSlider.module.css';

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
    <div className={s.heroSliderContainer}>
      <Carousel
        arrows={true}
        infinite={true}
        autoplay={true}
        autoplaySpeed={5000}
        effect="fade"
        dotPosition="bottom"
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className={s.heroSlideItem}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}