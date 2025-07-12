//src/components/ui/BackToTop.tsx

//description: Component (button) to scroll back to the top of the page
//export component

'use client'; // Đánh dấu là Client Component vì có interactivity
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300); // Hiển thị nút khi cuộn xuống quá 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      type="primary"
      shape="circle"
      icon={<ArrowUpOutlined />}
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: visible ? 'block' : 'none',
      }}
    />
  );
}