'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Pagination, Space, Tag as AntTag } from 'antd';
import { TagOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    knowledgeEntries: number;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function TagBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('limit') || '20';
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: parseInt(pageParam),
    limit: parseInt(pageSizeParam),
    pages: 0,
  });

  // Update URL with current pagination parameters
  const updateSearchParams = (params: { page?: number; limit?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.page !== undefined) {
      if (params.page > 1) newParams.set('page', params.page.toString());
      else newParams.delete('page');
    }
    
    if (params.limit !== undefined) {
      if (params.limit !== 20) newParams.set('limit', params.limit.toString());
      else newParams.delete('limit');
    }
    
    router.push(`/browse/tags?${newParams.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const params: { page?: number; limit?: number } = { page: newPage };
    
    if (newPageSize && newPageSize !== pagination.limit) {
      params.limit = newPageSize;
    }
    
    updateSearchParams(params);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Get random color for tag
  const getTagColor = (name: string) => {
    const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
    // Simple hash function to get consistent color for the same tag name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageParam);
        queryParams.set('limit', pageSizeParam);
        
        const response = await fetch(`/api/browse/tags?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setTags(data.tags);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching tags:', data.message);
          setTags([]);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [pageParam, pageSizeParam]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>Thẻ tài liệu</Title>
      
      <Card>
        <div className="mb-4">
          <Text>Có {pagination.total} thẻ</Text>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : tags.length === 0 ? (
          <Empty 
            description="Không có thẻ nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              {tags.map(tag => (
                <Link key={tag.id} href={`/browse/tag/${tag.id}`}>
                  <AntTag 
                    className="text-base py-1 px-3 cursor-pointer" 
                    color={getTagColor(tag.name)}
                  >
                    <Space>
                      <TagOutlined />
                      <span>{tag.name}</span>
                      <span className="text-xs opacity-80">({tag._count.knowledgeEntries})</span>
                    </Space>
                  </AntTag>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={['20', '50', '100']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} thẻ`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}