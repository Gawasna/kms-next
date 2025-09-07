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

  // Hàm render file preview cho thumbnail (bên trái)
  const renderThumbnailPreview = () => {
    if (document.fileMimeType?.startsWith('image/')) {
      // Thumbnail preview với kích thước nhỏ hơn và object-fit
      return <img src={document.fileStorageUrl!} alt={document.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />;
    }
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        <p className="mt-4 font-semibold">{document.fileName}</p>
      </div>
    );
  }

  // **THÊM MỚI: Hàm render preview chính trong section giữa**
  const renderMainPreview = () => {
    // Chỉ render nếu có file đính kèm
    if (!document.fileStorageUrl || !document.fileMimeType) {
      return null;
    }

    // Nếu là ảnh, hiển thị ảnh với style để không vỡ layout
    if (document.fileMimeType.startsWith('image/')) {
      return (
        <>
          <Divider />
          <Title level={4}>Xem trước tài liệu</Title>
          <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', background: '#fafafa' }}>
            <img
              src={document.fileStorageUrl}
              alt={`Xem trước ${document.title}`}
              style={{
                maxWidth: '100%',     // Quan trọng nhất: đảm bảo ảnh không rộng hơn thẻ chứa nó
                height: 'auto',       // Giữ đúng tỷ lệ ảnh
                display: 'block',     // Tránh khoảng trắng thừa bên dưới ảnh
                margin: '0 auto',     // Căn giữa ảnh
                borderRadius: '8px',  // Bo góc cho đẹp
              }}
            />
          </div>
        </>
      );
    }

    // do the same with video/ type
    if (document.fileMimeType.startsWith('video/')) {
      return (
        <>
          <Divider />
          <Title level={4}>Xem trước tài liệu</Title>
          <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', background: '#fafafa' }}>
            <video
              src={document.fileStorageUrl}
              controls // Hiển thị các nút điều khiển: play, pause, volume,...
              style={{
                width: '100%',        // Quan trọng: Video sẽ chiếm toàn bộ chiều rộng của thẻ chứa
                height: 'auto',       // Giữ đúng tỷ lệ của video
                display: 'block',     // Tránh khoảng trắng thừa
                borderRadius: '8px',  // Bo góc cho đồng bộ
              }}
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>
        </>
      );
    }

    // Nếu là file khác, có thể hiển thị một thông báo hoặc iframe (ví dụ cho PDF)
    // Hiện tại chỉ hiển thị thông báo chung
    return (
      <>
        <Divider />
        <Title level={4}>Tài liệu đính kèm</Title>
        <div className="text-center p-8 border rounded-lg bg-gray-50 mt-4">
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <p className="mt-4 font-semibold">{document.fileName}</p>
          <p className="text-sm text-gray-500">
            {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
          </p>
          <Button
            type="link"
            onClick={handleDownload}
            loading={isDownloading}
            disabled={!document.fileStorageUrl}
          >
            Tải xuống để xem
          </Button>
        </div>
      </>
    );
  };


  return (
    <Row gutter={[24, 24]}>
      {/* SECTION 1: Snapshot/Thumbnail + Action Buttons (Trái) */}
      <Col xs={24} md={8} lg={6}>
        <Card>
          {/* Sửa tên hàm để rõ ràng hơn */}
          {renderThumbnailPreview()}
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
          <Row gutter={[16, 16]}>
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

          {/* **THAY THẾ: Gọi hàm render preview chính tại đây** */}
          {renderMainPreview()}

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