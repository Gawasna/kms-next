'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Pagination, Tag, Space, Badge, Avatar } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, EyeOutlined, DownloadOutlined, LockOutlined, GlobalOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

interface CategoryDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  status: string;
  accessLevel: 'PUBLIC' | 'STUDENT_ONLY' | 'LECTURER_ONLY' | 'PRIVATE';
  viewsCount: number;
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
  author: { 
    id: string;
    name: string | null; 
    image: string | null;
  };
  tags: { name: string }[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function CategoryDoc({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('limit') || '10';
  
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
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
    
    router.push(`/browse/category/${categoryId}?${newParams.toString()}`);
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

  // Get access level icon and text
  const getAccessLevelInfo = (level: string) => {
    switch (level) {
      case 'PUBLIC':
        return { icon: <GlobalOutlined />, text: 'Công khai', color: 'green' };
      case 'STUDENT_ONLY':
        return { icon: <TeamOutlined />, text: 'Sinh viên', color: 'blue' };
      case 'LECTURER_ONLY':
        return { icon: <UserOutlined />, text: 'Giảng viên', color: 'purple' };
      case 'PRIVATE':
        return { icon: <LockOutlined />, text: 'Riêng tư', color: 'red' };
      default:
        return { icon: <LockOutlined />, text: 'Không xác định', color: 'default' };
    }
  };

  // Fetch category details and documents
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageParam);
        queryParams.set('limit', pageSizeParam);
        
        const response = await fetch(`/api/browse/categories/${categoryId}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCategory(data.category);
          setDocuments(data.documents);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching category data:', data.message);
          setCategory(null);
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        setCategory(null);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, pageParam, pageSizeParam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Card>
          <Empty 
            description="Không tìm thấy danh mục" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>
        <FileTextOutlined className="mr-2" />
        {category.name}
      </Title>
      
      {category.description && (
        <Paragraph className="text-gray-600 mb-6">
          {category.description}
        </Paragraph>
      )}
      
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text>Có {pagination.total} tài liệu trong danh mục này</Text>
          <Link href="/browse/category" className="text-blue-600 hover:underline">
            ← Quay lại danh sách danh mục
          </Link>
        </div>
        
        {documents.length === 0 ? (
          <Empty 
            description="Không có tài liệu nào trong danh mục này" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <>
            <List
              itemLayout="vertical"
              dataSource={documents}
              renderItem={(document) => {
                const accessLevel = getAccessLevelInfo(document.accessLevel);
                
                return (
                  <List.Item
                    key={document.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 rounded-md p-4"
                  >
                    <Link href={`/document/${document.id}`} className="block">
                      <Title level={4} className="mb-2 text-blue-600 hover:underline">
                        {document.title}
                      </Title>
                      
                      {document.description && (
                        <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600 mb-3">
                          {document.description}
                        </Paragraph>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Tag color={accessLevel.color}>
                          {accessLevel.icon} {accessLevel.text}
                        </Tag>
                        
                        {document.tags.map((tag, index) => (
                          <Tag key={index} color="default">
                            {tag.name}
                          </Tag>
                        ))}
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:justify-between mt-3 text-sm text-gray-500">
                        <Space className="mb-2 md:mb-0">
                          <Avatar src={document.author.image} size="small">
                            {document.author.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Text type="secondary">{document.author.name}</Text>
                          <ClockCircleOutlined className="ml-2" /> {formatDate(document.updatedAt)}
                        </Space>
                        
                        <Space>
                          <Badge count={document.viewsCount} showZero overflowCount={999} size="small">
                            <EyeOutlined className="text-gray-500" />
                          </Badge>
                          <Badge count={document.downloadsCount} showZero overflowCount={999} size="small">
                            <DownloadOutlined className="text-gray-500" />
                          </Badge>
                        </Space>
                      </div>
                    </Link>
                  </List.Item>
                );
              }}
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
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} tài liệu`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}