// src/components/documents/DocumentViewer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Row, Tag, Typography, Avatar, Space, Divider, message, Tooltip } from 'antd';
import { DownloadOutlined, EditOutlined, ShareAltOutlined, EyeOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, FolderOutlined, TagOutlined } from '@ant-design/icons';
import type { User, KnowledgeEntry, Category, Tag as TagType } from '@prisma/client'; // Import các kiểu dữ liệu
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

// Mở rộng kiểu dữ liệu để bao gồm các relations
type FullKnowledgeEntry = KnowledgeEntry & {
  author: User;
  category: Category | null;
  tags: TagType[];
};

// Kiểu cho current user
type CurrentUser = {
    id: string;
    role: string;
} | null | undefined;

interface DocumentViewerProps {
  document: FullKnowledgeEntry;
  currentUser: CurrentUser;
}

type Document = {
    id: string;
    title: string;
    author: User;
    fileStorageUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    createdAt: Date;
    updatedAt: Date;
}

type DocType = {
    filetype: 'md' | 'pdf' | 'image' | 'video' | 'doc' | 'ppt' | 'xls' | 'docx' | 'zip' | 'txt';
}

export default function DocumentViewer({ document, currentUser }: DocumentViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const isOwner = currentUser?.id === document.authorId;
  const isAdmin = currentUser?.role === 'ADMIN';

  const hasViewedInSession = useRef(false);

  useEffect(() => {
    const viewSessionKey = `viewed_${document.id}`;
    
    const alreadyViewed = sessionStorage.getItem(viewSessionKey);
    hasViewedInSession.current = !!alreadyViewed;

    if (!alreadyViewed) {
      const timer = setTimeout(() => {
        fetch(`/api/documents/${document.id}/view`, { method: 'POST' })
          .then(res => {
            if (res.ok) {
              console.log('View successfully recorded.');
              sessionStorage.setItem(viewSessionKey, 'true');
              hasViewedInSession.current = true;
            }
          })
          .catch(err => console.error('Failed to record view:', err));
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [document.id]);

  // Tải xuống
  const handleDownload = async () => {
    if (!document.fileStorageUrl) {
      message.error('Tài liệu này không có file đính kèm.');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hasViewed: hasViewedInSession.current }),
      });

      const result = await response.json();

      if (result.success && result.newViewCounted) {
        sessionStorage.setItem(`viewed_${document.id}`, 'true');
        hasViewedInSession.current = true;
      }
      
      window.open(document.fileStorageUrl, '_blank');
      message.success('Đang bắt đầu tải xuống...');

    } catch (error) {
      console.error('Download error:', error);
      message.error('Không thể tải file.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Hàm xử lý chia sẻ
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết vào clipboard!');
  };

  // Hàm render file preview (đơn giản hóa)
  const renderFilePreview = () => {
    if (document.fileMimeType?.startsWith('image/')) {
        return <img src={document.fileStorageUrl!} alt={document.title} className="max-w-full h-auto rounded-lg border" />;
    }
    return (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
            <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p className="mt-4 font-semibold">{document.fileName}</p>
            <p className="text-sm text-gray-500">
                {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
        </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {/* SECTION 1: Snapshot/Thumbnail + Action Buttons (Trái) */}
      <Col xs={24} md={8} lg={6}>
        <Card>
          {renderFilePreview()}
          <Divider />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                block 
                onClick={handleDownload}
                loading={isDownloading}
                disabled={!document.fileStorageUrl}
            >
              Tải xuống
            </Button>
            <Button icon={<ShareAltOutlined />} block onClick={handleShare}>
              Chia sẻ
            </Button>
            {(isOwner || isAdmin) && (
              <Link href={`/document/${document.id}/edit`}>
                <Button icon={<EditOutlined />} block>
                  Chỉnh sửa
                </Button>
              </Link>
            )}
          </Space>
        </Card>
      </Col>

      {/* SECTION 2: Mô tả tài liệu (Giữa) */}
      <Col xs={24} md={16} lg={12}>
        <Card>
            <Tag color="blue">{document.accessLevel.replace('_', ' ')}</Tag>
            <Title level={2} style={{ marginTop: '16px' }}>{document.title}</Title>
            
            <Space split={<Divider type="vertical" />} wrap style={{ marginBottom: '24px' }}>
                <Space>
                    <Avatar src={document.author.image} icon={<UserOutlined />} />
                    <Text strong>{document.author.name}</Text>
                </Space>
                <Space>
                    <CalendarOutlined />
                    <Text type="secondary">Ngày đăng: {new Date(document.createdAt).toLocaleDateString()}</Text>
                </Space>
                <Space>
                    <EyeOutlined />
                    <Text type="secondary">{document.viewsCount} lượt xem</Text>
                </Space>
            </Space>

            {document.description && (
                <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                    {document.description}
                </Paragraph>
            )}

            <Divider />

            <Title level={4}>Thông tin chi tiết</Title>
            <Row gutter={[16,16]}>
                <Col span={24}>
                    <Space>
                        <FolderOutlined />
                        <Text strong>Danh mục:</Text>
                        {document.category ? <Tag>{document.category.name}</Tag> : <Text>Chưa có</Text>}
                    </Space>
                </Col>
                <Col span={24}>
                    <Space align="start">
                        <TagOutlined style={{ paddingTop: '5px' }} />
                        <Text strong>Tags:</Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {document.tags.length > 0 ? (
                                document.tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>)
                            ) : (
                                <Text>Chưa có</Text>
                            )}
                        </div>
                    </Space>
                </Col>
            </Row>

            {document.content && document.content.trim() !== "" && (
              <>
                <Divider />
                <Title level={4}>Nội dung</Title>
                <div className="prose lg:prose-xl max-w-none">
                    {/* Render Markdown content here. You'll need a library like 'react-markdown' */}
                    <Paragraph>{document.content}</Paragraph>
                </div>
              </>
            )}
        </Card>
      </Col>

      {/* SECTION 3: Đề xuất (Phải) */}
      <Col xs={24} lg={6}>
        <Card title="Tài liệu liên quan">
          {/* TODO: Fetch và hiển thị danh sách các tài liệu đề xuất */}
          <Paragraph>
            Phần này sẽ hiển thị các tài liệu khác cùng danh mục, cùng tags, hoặc từ cùng tác giả.
          </Paragraph>
        </Card>
      </Col>
    </Row>
  );
}