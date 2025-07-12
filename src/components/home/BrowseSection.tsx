// src/components/home/BrowseSection.tsx
'use client'; // Client Component vì có thể có tương tác với checkbox

import React from 'react';
import { Checkbox, Button } from 'antd';
import Link from 'next/link';

interface BrowseItem {
  name: string;
  count: number;
  slug?: string;
}

interface BrowseSectionProps {
  title: string;
  items: BrowseItem[];
  type: 'category' | 'author' | 'tag' | 'year'; // Để phân biệt kiểu hiển thị
}

export default function BrowseSection({ title, items, type }: BrowseSectionProps) {
  const handleCheckboxChange = (e: any, item: BrowseItem) => {
    console.log(`Checkbox for ${item.name} (${type}) changed:`, e.target.checked);
    // TODO: Implement filtering logic based on checked items
  };

  const getLinkHref = (item: BrowseItem) => {
    // Example link structure based on type
    switch (type) {
      case 'category': return `/documents?category=${item.slug || item.name}`;
      case 'author': return `/documents?author=${item.slug || item.name}`;
      case 'tag': return `/documents?tag=${item.slug || item.name}`;
      case 'year': return `/documents?year=${item.name}`;
      default: return '#';
    }
  };

  return (
    <div className="browse-section-card">
      <h4>{title}</h4>
      <div className="browse-list">
        {items.map((item, index) => (
          <div key={`${type}-${index}`} className="browse-item">
            {type === 'category' ? (
              <Checkbox onChange={(e) => handleCheckboxChange(e, item)}>
                <Link href={getLinkHref(item)} className="browse-item-link">
                  {item.name} <span className="item-count">({item.count})</span>
                </Link>
              </Checkbox>
            ) : (
              <Link href={getLinkHref(item)} className="browse-item-link">
                {item.name} <span className="item-count">({item.count})</span>
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="browse-footer">
        <Link href={`/browse/${type}`} className="browse-next-link">
          Trang sau {'>>'} 
        </Link>
      </div>
    </div>
  );
}