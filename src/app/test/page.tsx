//blank page (only for testing component here)
import React from 'react';

//import component to test bellow this line
import CarouselSlider from './../../components/test/CarouselSlider';

export default function Page() {
  const bannerImages = [
    {
      id: '1',
      src: 'https://placehold.co/800x400/FF5733/FFFFFF?text=KIMS+Slide+1',
      alt: 'KIMS Banner Slide 1',
    },
    {
      id: '2',
      src: 'https://placehold.co/800x400/33FF57/FFFFFF?text=KIMS+Slide+2',
      alt: 'KIMS Banner Slide 2',
    },
    {
      id: '3',
      src: 'https://placehold.co/800x400/3357FF/FFFFFF?text=KIMS+Slide+3',
      alt: 'KIMS Banner Slide 3',
    },
    {
      id: '4',
      src: 'https://placehold.co/800x400/FF33E0/FFFFFF?text=KIMS+Slide+4',
      alt: 'KIMS Banner Slide 4',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Banner Carousel Demo</h1>
      <CarouselSlider
        images={bannerImages}
        autoplay={true}
        speed={4000}
      />

    </div>
  );
}