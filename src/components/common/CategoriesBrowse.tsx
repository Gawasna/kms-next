'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Pagination, Space, Tag } from 'antd';
import { FolderOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

interface Category {
  id: string;
  name: string;
  description: string | null;
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

export default function CategoriesBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('limit') || '10';
  
  const [categories, setCategories] = useState<Category[]>([]);
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
      if (params.limit !== 10) newParams.set('limit', params.limit.toString());
      else newParams.delete('limit');
    }
    
    router.push(`/browse/categories?${newParams.toString()}`);
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageParam);
        queryParams.set('limit', pageSizeParam);
        
        const response = await fetch(`/api/browse/categories?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching categories:', data.message);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [pageParam, pageSizeParam]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>Danh mục tài liệu</Title>
      
      <Card>
        <div className="mb-4">
          <Text>Có {pagination.total} danh mục</Text>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : categories.length === 0 ? (
          <Empty 
            description="Không có danh mục nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <>
            <List
              itemLayout="vertical"
              dataSource={categories}
              renderItem={(category) => (
                <List.Item
                  key={category.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 rounded-md p-4"
                >
                  <Link href={`/browse/category/${category.id}`} className="block">
                    <Title level={4} className="mb-2 text-blue-600 hover:underline">
                      <FolderOutlined className="mr-2" />
                      {category.name}
                    </Title>
                    
                    {category.description && (
                      <Text type="secondary" className="block mb-3">
                        {category.description}
                      </Text>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:justify-between mt-3 text-sm text-gray-500">
                      <Space>
                        <Tag color="blue">
                          <FileTextOutlined className="mr-1" />
                          {category._count.knowledgeEntries} tài liệu
                        </Tag>
                        <ClockCircleOutlined className="ml-2" /> Cập nhật: {formatDate(category.updatedAt)}
                      </Space>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
            
            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={['5', '10', '20', '50']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} danh mục`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}