'use client';

import React, { useEffect, useState } from 'react';
import { Checkbox, Button, Spin } from 'antd';
import Link from 'next/link';

interface TopCategory {
  id: string;
  name: string;
  documentCount: number;
}

interface TopAuthor {
  id: string;
  name: string;
  image: string | null;
  documentCount: number;
}

interface TopTag {
  id: string;
  name: string;
  documentCount: number;
}

interface TopYear {
  year: number;
  documentCount: number;
}

type BrowseItem = {
  id?: string;
  name: string;
  count: number;
  slug?: string;
};

interface BrowseSectionProps {
  title: string;
  type: 'category' | 'author' | 'tag' | 'year';
  limit?: number;
}

export default function BrowseSection({ title, type, limit = 5 }: BrowseSectionProps) {
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        
        switch (type) {
          case 'category':
            endpoint = `/api/browse/top-categories?limit=${limit}`;
            break;
          case 'author':
            endpoint = `/api/browse/top-authors?limit=${limit}`;
            break;
          case 'tag':
            endpoint = `/api/browse/top-tags?limit=${limit}`;
            break;
          case 'year':
            endpoint = `/api/browse/top-years?limit=${limit}`;
            break;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Không thể tải dữ liệu ${type}`);
        }
        
        const data = await response.json();
        
        // Format data based on type
        let formattedItems: BrowseItem[] = [];
        
        switch (type) {
          case 'category':
            formattedItems = (data as TopCategory[]).map(item => ({
              id: item.id,
              name: item.name,
              count: item.documentCount,
              slug: item.name.toLowerCase().replace(/ /g, '-')
            }));
            break;
          case 'author':
            formattedItems = (data as TopAuthor[]).map(item => ({
              id: item.id,
              name: item.name,
              count: item.documentCount,
              slug: item.id
            }));
            break;
          case 'tag':
            formattedItems = (data as TopTag[]).map(item => ({
              id: item.id,
              name: item.name,
              count: item.documentCount,
              slug: item.name.toLowerCase().replace(/ /g, '-')
            }));
            break;
          case 'year':
            formattedItems = (data as TopYear[]).map(item => ({
              name: item.year.toString(),
              count: item.documentCount,
              slug: item.year.toString()
            }));
            break;
        }
        
        setItems(formattedItems);
      } catch (err) {
        console.error(`Error fetching ${type} data:`, err);
        setError(`Không thể tải dữ liệu ${type}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, limit]);

  const handleCheckboxChange = (e: any, item: BrowseItem) => {
    console.log(`Checkbox for ${item.name} (${type}) changed:`, e.target.checked);
    // TODO: Implement filtering logic based on checked items
  };

  const getLinkHref = (item: BrowseItem) => {
    switch (type) {
      case 'category': return `/documents?category=${item.slug || item.name}`;
      case 'author': return `/documents?author=${item.slug || item.name}`;
      case 'tag': return `/documents?tag=${item.slug || item.name}`;
      case 'year': return `/documents?year=${item.name}`;
      default: return '#';
    }
  };

  if (loading) {
    return (
      <div className="browse-section-card">
        <h4>{title}</h4>
        <div className="browse-list-loading">
          <Spin size="small" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-section-card">
        <h4>{title}</h4>
        <div className="browse-list-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-section-card">
      <h4>{title}</h4>
      <div className="browse-list">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${type}-${item.id || index}`} className="browse-item">
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
          ))
        ) : (
          <p className="no-items">Không có dữ liệu</p>
        )}
      </div>
      <div className="browse-footer">
        <Link href={`/browse/${type}`} className="browse-next-link">
          Trang sau {'>>'} 
        </Link>
      </div>
    </div>
  );
}