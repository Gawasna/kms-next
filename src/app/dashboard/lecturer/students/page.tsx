'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  message,
  Spin,
  Empty,
  Tooltip,
  DatePicker,
  Badge,
  Alert,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  UserAddOutlined, 
  DeleteOutlined, 
  MailOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Document with shared permissions
interface SharedDocument {
  id: string;
  title: string;
  description: string | null;
  accessLevel: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  permissionCount: number; // Number of specific students with access
}

// Permission details for a specific document
interface UserPermission {
  id: string;
  expiresAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface DocumentBasic {
  id: string;
  title: string;
  accessLevel: string;
}

interface ShareData {
  document: DocumentBasic;
  permissions: UserPermission[];
}

const StudentSharingManagement = () => {
  // For the documents list view
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [searchText, setSearchText] = useState('');

  // For the student permissions view
  const [selectedDocument, setSelectedDocument] = useState<DocumentBasic | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // For sharing functionality
  const [sharingModalVisible, setSharingModalVisible] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [deadlineOption, setDeadlineOption] = useState('none');
  const [customDeadline, setCustomDeadline] = useState<Date | null>(null);
  const [form] = Form.useForm();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');

  // Fetch all documents that have specific student sharing
  const fetchSharedDocuments = async () => {
    setLoadingDocuments(true);
    try {
      // We'll fetch all documents from the user that have STUDENT_ONLY access level
      // and at least one specific permission
      const response = await fetch('/api/documents/my?withPermissions=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared documents');
      }
      
      const data = await response.json();
      
      // Filter to only show documents with STUDENT_ONLY access and specific permissions
      const filteredDocs = data.documents.filter((doc: any) => 
        (doc.accessLevel === 'STUDENT_ONLY' || doc.accessLevel === 'PRIVATE') && 
        doc.permissions && 
        doc.permissions.length > 0
      );
      
      // Format the data to include permission count
      const formattedDocs = filteredDocs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        accessLevel: doc.accessLevel,
        status: doc.status,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
        permissionCount: doc.permissions.length
      }));
      
      setSharedDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching shared documents:', error);
      message.error('Không thể tải danh sách tài liệu được chia sẻ');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Fetch permissions for a specific document
  const fetchDocumentSharing = async (docId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/my/share?documentId=${docId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document sharing information');
      }
      
      const data: ShareData = await response.json();
      setSelectedDocument(data.document);
      setPermissions(data.permissions);
    } catch (error) {
      console.error('Error fetching document sharing:', error);
      message.error('Không thể tải thông tin chia sẻ tài liệu');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (documentId) {
      fetchDocumentSharing(documentId);
    } else {
      fetchSharedDocuments();
    }
  }, [documentId]);

  // Handle viewing a specific document's permissions
  const handleViewDocumentPermissions = (docId: string) => {
    router.push(`/dashboard/lecturer/students?documentId=${docId}`);
  };

  // Handle back to documents list
  const handleBackToDocumentsList = () => {
    router.push('/dashboard/lecturer/students');
  };

  // Show the sharing modal
  const showSharingModal = () => {
    form.resetFields();
    
    // Pre-populate with existing emails
    const existingEmails = permissions.map(p => p.user.email).filter(email => email !== null) as string[];
    setSelectedEmails(existingEmails);
    
    setDeadlineOption('none');
    setCustomDeadline(null);
    setSharingModalVisible(true);
  };

  // Handle form submission
  const handleSubmitSharing = async (values: any) => {
    if (!selectedDocument?.id) {
      message.error('Không có tài liệu được chọn');
      return;
    }

    // If no emails selected, show error
    if (!selectedEmails.length) {
      message.error('Vui lòng nhập ít nhất một email sinh viên');
      return;
    }

    try {
      const permissions = {
        emails: selectedEmails,
        deadline: {
          option: deadlineOption,
          dates: deadlineOption === 'custom' && customDeadline 
            ? customDeadline.toISOString() 
            : null
        }
      };

      const response = await fetch('/api/documents/my/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          permissions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật chia sẻ');
      }

      const result = await response.json();
      
      // Show success message
      message.success(`Đã cập nhật chia sẻ cho ${result.sharedCount} sinh viên`);
      
      // Show warning if some emails weren't found
      if (result.notFoundEmails && result.notFoundEmails.length > 0) {
        Modal.warning({
          title: 'Một số email không được tìm thấy',
          content: (
            <div>
              <p>Những email sau không khớp với tài khoản sinh viên nào trong hệ thống:</p>
              <ul>
                {result.notFoundEmails.map((email: string) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          ),
        });
      }
      
      // Close modal and refresh data
      setSharingModalVisible(false);
      fetchDocumentSharing(selectedDocument.id);
    } catch (error) {
      console.error('Error updating sharing:', error);
      message.error('Không thể cập nhật chia sẻ tài liệu');
    }
  };

  // Handle delete permission
  const handleDeletePermission = (permissionId: string) => {
    Modal.confirm({
      title: 'Xóa quyền truy cập',
      content: 'Bạn có chắc chắn muốn xóa quyền truy cập cho người dùng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await fetch(`/api/documents/my/share?permissionId=${permissionId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete permission');
          }
          
          message.success('Đã xóa quyền truy cập thành công');
          
          // Refresh the permissions list
          if (selectedDocument?.id) {
            fetchDocumentSharing(selectedDocument.id);
          }
        } catch (error) {
          console.error('Error deleting permission:', error);
          message.error('Không thể xóa quyền truy cập');
        }
      },
    });
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không giới hạn';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Table columns for document list
  const documentColumns = [
    {
      title: 'Tài liệu',
      key: 'document',
      render: (record: SharedDocument) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description.length > 80 
                ? record.description.substring(0, 80) + '...' 
                : record.description}
            </Text>
          )}
          {record.fileName && (
            <Text type="secondary" className="text-xs">
              <FileTextOutlined className="mr-1" />
              {record.fileName} ({formatFileSize(record.fileSize)})
            </Text>
          )}
        </Space>
      ),
      sorter: (a: SharedDocument, b: SharedDocument) => a.title.localeCompare(b.title),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: boolean | React.Key, record: SharedDocument) => 
        record.title.toLowerCase().includes(String(value).toLowerCase()) ||
        (record.description && record.description.toLowerCase().includes(String(value).toLowerCase())) ||
        (record.fileName && record.fileName.toLowerCase().includes(String(value).toLowerCase())),
    },
    {
      title: 'Quyền truy cập',
      key: 'access',
      render: (record: SharedDocument) => (
        <Space>
          <Tag color={record.accessLevel === 'STUDENT_ONLY' ? 'purple' : 'red'}>
            {record.accessLevel === 'STUDENT_ONLY' ? 'Chỉ sinh viên' : 'Riêng tư'}
          </Tag>
          <Badge 
            count={record.permissionCount} 
            overflowCount={99}
            style={{ backgroundColor: '#1890ff' }}
          />
        </Space>
      ),
      filters: [
        { text: 'Chỉ sinh viên', value: 'STUDENT_ONLY' },
        { text: 'Riêng tư', value: 'PRIVATE' },
      ],
      onFilter: (value: string, record: SharedDocument) => record.accessLevel === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: SharedDocument, b: SharedDocument) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: SharedDocument) => (
        <Button 
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDocumentPermissions(record.id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Table columns for permissions list
  const permissionColumns = [
    {
      title: 'Sinh viên',
      key: 'student',
      render: (record: UserPermission) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user.name || 'Chưa cập nhật tên'}</Text>
          <Text type="secondary">
            <MailOutlined className="mr-1" />
            {record.user.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Ngày được chia sẻ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thời hạn truy cập',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string | null, record: UserPermission) => {
        if (!date) {
          return <Tag color="green">Không giới hạn</Tag>;
        }
        
        const expiryDate = new Date(date);
        const now = new Date();
        const isExpired = expiryDate < now;
        
        return (
          <Space>
            {isExpired ? (
              <Tag color="red">Đã hết hạn</Tag>
            ) : (
              <Tag color="blue">Còn hạn</Tag>
            )}
            <Text>{formatDate(date)}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: UserPermission) => (
        <Button 
          icon={<DeleteOutlined />} 
          danger
          onClick={() => handleDeletePermission(record.id)}
        >
          Xóa quyền
        </Button>
      ),
    },
  ];

  // Show document list if no document ID is selected
  if (!documentId) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>Quản lý chia sẻ tài liệu cho sinh viên</Title>
        </div>

        <Card>
          <div className="mb-4">
            <Input
              placeholder="Tìm kiếm tài liệu..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>

          {loadingDocuments ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <div className="mt-3">Đang tải dữ liệu...</div>
            </div>
          ) : sharedDocuments.length === 0 ? (
            <Empty 
              description="Bạn chưa có tài liệu nào được chia sẻ cho sinh viên cụ thể" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                onClick={() => router.push('/dashboard/lecturer/documents')}
              >
                Quản lý tài liệu
              </Button>
            </Empty>
          ) : (
            <Table
              columns={documentColumns}
              dataSource={sharedDocuments}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </div>
    );
  }

  // Show permissions list for a specific document
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Space direction="vertical" size={2}>
          <Title level={3}>Quản lý chia sẻ tài liệu</Title>
          {selectedDocument && (
            <Text>
              Tài liệu: <Text strong>{selectedDocument.title}</Text>
              <Tag 
                color={selectedDocument.accessLevel === 'PRIVATE' ? 'red' : 'purple'} 
                className="ml-2"
              >
                {selectedDocument.accessLevel === 'PRIVATE' ? 'Riêng tư' : 'Chỉ sinh viên'}
              </Tag>
            </Text>
          )}
        </Space>
        <Space>
          <Button 
            icon={<RollbackOutlined />} 
            onClick={handleBackToDocumentsList}
          >
            Quay lại danh sách
          </Button>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showSharingModal}
          >
            Cập nhật danh sách chia sẻ
          </Button>
        </Space>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
            <div className="mt-3">Đang tải dữ liệu...</div>
          </div>
        ) : permissions.length === 0 ? (
          <Empty 
            description="Chưa có sinh viên nào được chia sẻ tài liệu này" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<UserAddOutlined />} onClick={showSharingModal}>
              Thêm sinh viên
            </Button>
          </Empty>
        ) : (
          <div>
            <div className="mb-4">
              <Badge 
                count={permissions.length} 
                showZero 
                className="mr-2"
                style={{ backgroundColor: '#1890ff' }}
              />
              <Text>sinh viên đang được chia sẻ tài liệu này</Text>
            </div>
            <Table
              columns={permissionColumns}
              dataSource={permissions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </Card>

      {/* Modal thêm sinh viên */}
      <Modal
        title="Cập nhật danh sách chia sẻ"
        open={sharingModalVisible}
        onCancel={() => setSharingModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSharing}
        >
          <div className="mb-4">
            <Alert
              message="Lưu ý về cập nhật danh sách chia sẻ"
              description={
                <div>
                  <p>Khi bạn cập nhật danh sách này, tất cả các quyền chia sẻ hiện tại sẽ bị xóa và thay thế bằng danh sách mới.</p>
                  <p>Nếu bạn muốn giữ lại các quyền hiện tại, hãy đảm bảo thêm lại tất cả email vào danh sách.</p>
                </div>
              }
              type="warning"
              showIcon
            />
          </div>

          <Form.Item
            label={
              <Space>
                <TeamOutlined />
                <span>Danh sách email sinh viên</span>
              </Space>
            }
            name="emails"
            rules={[{ required: true, message: 'Vui lòng nhập ít nhất một email' }]}
            initialValue={permissions.map(p => p.user.email).filter(email => email !== null)}
          >
            <Select
              mode="tags"
              placeholder="Nhập email sinh viên (nhấn Enter sau mỗi email)"
              style={{ width: '100%' }}
              onChange={setSelectedEmails}
              tokenSeparators={[',']}
              defaultValue={permissions.map(p => p.user.email).filter(email => email !== null) as string[]}
            >
              {permissions.map(p => (
                <Select.Option key={p.user.email || ''} value={p.user.email || ''}>
                  {p.user.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <ClockCircleOutlined />
                <span>Thời hạn truy cập</span>
              </Space>
            }
            name="deadlineOption"
            initialValue="none"
          >
            <Select onChange={setDeadlineOption} value={deadlineOption}>
              <Select.Option value="none">Không giới hạn</Select.Option>
              <Select.Option value="30d">30 ngày</Select.Option>
              <Select.Option value="60d">60 ngày</Select.Option>
              <Select.Option value="90d">90 ngày</Select.Option>
              <Select.Option value="custom">Tùy chỉnh</Select.Option>
            </Select>
          </Form.Item>

          {deadlineOption === 'custom' && (
            <Form.Item
              label="Ngày hết hạn"
              name="customDeadline"
              rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
            >
              <DatePicker 
                placeholder="Chọn ngày hết hạn" 
                onChange={(date) => setCustomDeadline(date?.toDate() || null)} 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().endOf('day')}
              />
            </Form.Item>
          )}

          <Form.Item>
            <div className="flex justify-end">
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => setSharingModalVisible(false)}
              >
                Hủy bỏ
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
              >
                Cập nhật danh sách
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentSharingManagement;