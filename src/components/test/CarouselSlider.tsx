// src/components/test/CarouselSlider.tsx
'use client';

import { Carousel } from 'antd';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './CarouselSlider.module.css';

type CarouselImage = {
  id: string;
  src: string;
  alt: string;
};

interface CarouselSliderProps {
  images: CarouselImage[];
  autoplay?: boolean;
  speed?: number;
  className?: string;
}

const CarouselSlider = ({
  images,
  autoplay = true,
  speed = 3000,
  className = '',
}: CarouselSliderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !images || images.length === 0) {
    return <div className={`${styles.carouselPlaceholder} ${className}`} />;
  }

  return (
    <div className={`${styles.carouselWrapper} ${className}`}>
      <Carousel
        autoplay={autoplay}
        autoplaySpeed={speed}
        effect='fade'
        dots={true}
        arrows={true}
        className={styles.carousel}
      >
        {images.map((image, index) => (
          <div key={image.id} className={styles.imageContainer}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={styles.carouselImage}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselSlider;