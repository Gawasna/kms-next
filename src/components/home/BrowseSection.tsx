'use client';

import React from 'react';
import { Button, Card, Empty, Typography, Badge, List, Space } from 'antd';
import Link from 'next/link';
import { RightOutlined, TagOutlined, UserOutlined, FolderOutlined, CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

type BrowseItem = {
  id?: string;
  name: string;
  count: number;
  slug?: string;
};

interface BrowseSectionProps {
  title: string;
  type: 'category' | 'author' | 'tag' | 'year';
  items: BrowseItem[];
}

export default function BrowseSection({ title, type, items }: BrowseSectionProps) {
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

  const renderItem = (item: BrowseItem) => (
    <List.Item className="browse-list-item">
      <Link href={getLinkHref(item)} className="browse-item-link">
        <Space>
          {item.name} <Badge count={item.count} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      </Link>
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
    </Card>
  );
}
