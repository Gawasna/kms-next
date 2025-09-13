'use client';

import React, { useEffect, useState } from 'react';
import { Checkbox, Button, Spin, Card, Empty, Typography, Badge, List, Space } from 'antd';
import Link from 'next/link';
import { RightOutlined, TagOutlined, UserOutlined, FolderOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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
  items?: BrowseItem[];
}

export default function BrowseSection({ title, type, limit = 5 }: BrowseSectionProps) {
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
    const itemId = item.id || item.name;
    if (e.target.checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
    console.log(`Checkbox for ${item.name} (${type}) changed:`, e.target.checked);
  };

  const getLinkHref = (item: BrowseItem) => {
    switch (type) {
      case 'category': return `/browse/category/${item.id}`;
      case 'author': return `/browse/author/${item.id}`;
      case 'tag': return `/browse/tag/${item.id}`;
      case 'year': return `/browse/year/${item.name}`;
      default: return '#';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'category': return <FolderOutlined />;
      case 'author': return <UserOutlined />;
      case 'tag': return <TagOutlined />;
      case 'year': return <CalendarOutlined />;
      default: return null;
    }
  };

  const renderItem = (item: BrowseItem, index: number) => (
    <List.Item className="browse-list-item">
      {type === 'category' ? (
          <Link href={getLinkHref(item)} className="browse-item-link">
            {item.name} <Badge count={item.count} showZero style={{ backgroundColor: '#52c41a' }} />
          </Link>
      ) : (
        <Link href={getLinkHref(item)} className="browse-item-link">
          <Space>
            {item.name} <Badge count={item.count} showZero style={{ backgroundColor: '#52c41a' }} />
          </Space>
        </Link>
      )}
    </List.Item>
  );

  return (
    <Card 
      className="browse-section-card" 
      title={
        <Space>
          {getIcon()}
          <Text strong>{title}</Text>
        </Space>
      }
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ padding: '12px', height: 'calc(100% - 45px)' }}
    >
      {loading ? (
        <div className="browse-list-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Space direction="vertical" align="center">
            <Spin size="small" />
            <Text type="secondary">Đang tải...</Text>
          </Space>
        </div>
      ) : error ? (
        <div className="browse-list-error">
          <Empty 
            description={error} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      ) : (
        <div className="browse-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <List
            className="browse-list"
            dataSource={items}
            locale={{ emptyText: <Empty description="Không có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            renderItem={renderItem}
            size="small"
            style={{ flex: 1, overflow: 'auto' }}
          />
          <div className="browse-footer" style={{ marginTop: '12px', textAlign: 'right' }}>
            <Link href={`/browse/${type}`} className="browse-next-link">
              <Button type="link" size="small">
                <Space>
                  Trang sau <RightOutlined />
                </Space>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}