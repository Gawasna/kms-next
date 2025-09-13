'use client';

import { useState, useEffect } from 'react';
import { Card, List, Typography, Spin, Empty, Pagination, Avatar, Space, Tag, Statistic, Row, Col, Divider } from 'antd';
import { 
  UserOutlined, FileTextOutlined, ClockCircleOutlined, EyeOutlined, 
  DownloadOutlined, LockOutlined, GlobalOutlined, TeamOutlined, 
  FolderOutlined, TagOutlined, RocketOutlined, BookOutlined, CrownOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

interface AuthorDetail {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
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
  category: {
    id: string;
    name: string;
  } | null;
  tags: { 
    id: string;
    name: string 
  }[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AuthorDoc({ authorId }: { authorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('limit') || '10';
  
  const [author, setAuthor] = useState<AuthorDetail | null>(null);
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
    
    router.push(`/browse/author/${authorId}?${newParams.toString()}`);
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

  // Get tag color
  const getTagColor = (name: string) => {
    const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
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

  // Fetch author details and documents
  useEffect(() => {
    const fetchAuthorData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageParam);
        queryParams.set('limit', pageSizeParam);
        
        const response = await fetch(`/api/browse/authors/${authorId}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch author data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAuthor(data.author);
          setDocuments(data.documents);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching author data:', data.message);
          setAuthor(null);
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        setAuthor(null);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId, pageParam, pageSizeParam]);

  // Calculate total views and downloads
  const totalViews = documents.reduce((sum, doc) => sum + doc.viewsCount, 0);
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloadsCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Card>
          <Empty 
            description="Không tìm thấy tác giả" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </Card>
      </div>
    );
  }

  const roleBadge = getRoleBadge(author.role);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <Avatar 
            size={100} 
            src={author.image}
            icon={<UserOutlined />}
            className="mb-4 md:mb-0 md:mr-6"
          />
          <div className="text-center md:text-left flex-1">
            <Title level={3} className="m-0 mb-2">
              {author.name || 'Người dùng ẩn danh'}
            </Title>
            
            <Tag color={roleBadge.color} className="mb-3">
              {roleBadge.icon} {roleBadge.text}
            </Tag>
            
            <Text type="secondary" className="block mb-4">
              Tham gia từ {formatDate(author.createdAt)}
            </Text>
            
            <Row gutter={16} className="mt-4">
              <Col span={8}>
                <Statistic 
                  title="Tài liệu" 
                  value={pagination.total} 
                  prefix={<FileTextOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Lượt xem" 
                  value={totalViews} 
                  prefix={<EyeOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Lượt tải" 
                  value={totalDownloads} 
                  prefix={<DownloadOutlined />} 
                />
              </Col>
            </Row>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/browse/author" className="text-blue-600 hover:underline">
              ← Quay lại danh sách tác giả
            </Link>
          </div>
        </div>
      </Card>
      
      <Title level={4}>Tài liệu của tác giả</Title>
      
      <Card>
        <div className="mb-4">
          <Text>Có {pagination.total} tài liệu được chia sẻ</Text>
        </div>
        
        {documents.length === 0 ? (
          <Empty 
            description="Không có tài liệu nào" 
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
                        
                        {document.category && (
                          <Tag color="default">
                            <FolderOutlined /> {document.category.name}
                          </Tag>
                        )}
                        
                        {document.tags.map((tag) => (
                          <Tag key={tag.id} color={getTagColor(tag.name)}>
                            <TagOutlined /> {tag.name}
                          </Tag>
                        ))}
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:justify-between mt-3 text-sm text-gray-500">
                        <div>
                          <ClockCircleOutlined /> {formatDate(document.updatedAt)}
                        </div>
                        
                        <Space>
                          <span>
                            <EyeOutlined className="mr-1" />
                            {document.viewsCount}
                          </span>
                          <span>
                            <DownloadOutlined className="mr-1" />
                            {document.downloadsCount}
                          </span>
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