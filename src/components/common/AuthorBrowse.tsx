'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Pagination, Avatar, Space, Tag } from 'antd';
import { UserOutlined, FileTextOutlined, BookOutlined, RocketOutlined, CrownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
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

export default function AuthorBrowse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('limit') || '20';
  
  const [authors, setAuthors] = useState<Author[]>([]);
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
    
    router.push(`/browse/author?${newParams.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const params: { page?: number; limit?: number } = { page: newPage };
    
    if (newPageSize && newPageSize !== pagination.limit) {
      params.limit = newPageSize;
    }
    
    updateSearchParams(params);
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { icon: <CrownOutlined />, text: 'Quản trị viên', color: 'red' };
      case 'LECTURER':
        return { icon: <RocketOutlined />, text: 'Giảng viên', color: 'purple' };
      case 'STUDENT':
        return { icon: <BookOutlined />, text: 'Sinh viên', color: 'blue' };
      default:
        return { icon: <UserOutlined />, text: 'Người dùng', color: 'default' };
    }
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

  // Fetch authors
  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageParam);
        queryParams.set('limit', pageSizeParam);
        
        const response = await fetch(`/api/browse/authors?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch authors');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAuthors(data.authors);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching authors:', data.message);
          setAuthors([]);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [pageParam, pageSizeParam]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>Tác giả</Title>
      
      <Card>
        <div className="mb-4">
          <Text>Có {pagination.total} tác giả</Text>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : authors.length === 0 ? (
          <Empty 
            description="Không có tác giả nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 4,
                xxl: 4,
              }}
              dataSource={authors}
              renderItem={(author) => {
                const roleBadge = getRoleBadge(author.role);
                
                return (
                  <List.Item>
                    <Link href={`/browse/author/${author.id}`}>
                      <Card 
                        hoverable 
                        className="text-center flex flex-col items-center h-full"
                      >
                        <Avatar 
                          size={80} 
                          src={author.image}
                          icon={<UserOutlined />}
                          className="mb-3"
                        />
                        <Title level={5} className="m-0 mb-1 text-blue-600">
                          {author.name || 'Người dùng ẩn danh'}
                        </Title>
                        
                        <Tag color={roleBadge.color} className="mb-3">
                          {roleBadge.icon} {roleBadge.text}
                        </Tag>
                        
                        <Space direction="vertical" size={0} className="text-center">
                          <Text strong>
                            <FileTextOutlined className="mr-1" />
                            {author._count.knowledgeEntries} tài liệu
                          </Text>
                          <Text type="secondary" className="text-xs">
                            Tham gia từ {formatDate(author.createdAt)}
                          </Text>
                        </Space>
                      </Card>
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
                  pageSizeOptions={['20', '50', '100']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} tác giả`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}