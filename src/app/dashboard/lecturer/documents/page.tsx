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
  Modal, // Vẫn import Modal nếu bạn dùng các component Modal thông thường, nhưng dùng app.modal cho confirm
  Form,
  Select,
  Upload,
  // message, // Không cần import message trực tiếp nữa
  Spin,
  Empty,
  Tooltip,
  Badge,
  App // <-- THÊM CÁI NÀY
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { AccessLevel, KnowledgeEntryStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

// Type definitions based on your API
interface Document {
  id: string;
  title: string;
  description: string | null;
  accessLevel: AccessLevel;
  status: KnowledgeEntryStatus;
  fileStorageUrl: string | null;
  fileName: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
  permissions: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bọc component chính trong một component con để có thể sử dụng App.useApp()
const LecturerDocumentsManagementContent = () => { // Đổi tên component nội bộ
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const router = useRouter();

  // Sử dụng App.useApp() để lấy các instance message và modal có ngữ cảnh
  const { message: appMessage, modal: appModal } = App.useApp();

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = `/api/documents/my?page=${currentPage}&limit=${pageSize}`;
      if (searchText) {
        url += `&keyword=${encodeURIComponent(searchText)}`;
      }
      if (categoryFilter) {
        url += `&categoryId=${categoryFilter}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching documents:', error);
      appMessage.error('Failed to load documents'); // Sử dụng appMessage
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for the form dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      appMessage.error('Failed to load categories'); // Sử dụng appMessage
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [currentPage, pageSize, categoryFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleDelete = (id: string) => {
    appModal.confirm({ // <-- THAY THẾ Modal.confirm BẰNG appModal.confirm
      title: 'Bạn có chắc chắn muốn xóa tài liệu này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await fetch(`/api/documents/my?id=${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json(); // Lấy thông báo lỗi từ backend
            throw new Error(errorData.message || 'Failed to delete document');
          }

          appMessage.success('Xóa tài liệu thành công'); // Sử dụng appMessage
          fetchDocuments(); // Refresh the document list
        } catch (error: any) { // Cải thiện kiểu lỗi để truy cập message
          console.error('Error deleting document:', error);
          appMessage.error(`Không thể xóa tài liệu: ${error.message || 'Lỗi không xác định'}`); // Sử dụng appMessage
        }
      },
    });
  };

  const showModal = () => {
    form.resetFields();
    setFileList([]);
    setSelectedTags([]);
    setIsModalVisible(true);
  };

  const navigateUpload = () => {
    router.push('/document/upload');
  };

  const showUpdateModal = (document: Document) => {
    setSelectedDocument(document);
    updateForm.setFieldsValue({
      id: document.id,
      status: document.status,
      accessLevel: document.accessLevel,
    });
    setIsUpdateModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    setSelectedDocument(null);
  };

  const handleUpdateSubmit = async (values: any) => {
    try {
      const response = await fetch('/api/documents/my', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update document');
      }

      appMessage.success('Cập nhật tài liệu thành công'); // Sử dụng appMessage
      setIsUpdateModalVisible(false);
      fetchDocuments(); // Refresh the document list
    } catch (error: any) {
      console.error('Error updating document:', error);
      appMessage.error(`Không thể cập nhật tài liệu: ${error.message || 'Lỗi không xác định'}`); // Sử dụng appMessage
    }
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      appMessage.error('Vui lòng tải lên một tập tin'); // Sử dụng appMessage
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('accessLevel', values.accessLevel);

      if (values.categoryId) {
        formData.append('categoryId', values.categoryId);
      }

      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }

      if (values.permissions) {
        const permissionsData = {
          emails: values.permissions.emails || [],
          deadline: {
            option: values.permissions.deadlineOption || 'none',
            dates: values.permissions.deadlineDates || null,
          }
        };
        formData.append('permissions', JSON.stringify(permissionsData));
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      appMessage.success('Tải lên tài liệu thành công'); // Sử dụng appMessage
      setIsModalVisible(false);
      fetchDocuments(); // Refresh the document list
    } catch (error: any) {
      console.error('Error uploading document:', error);
      appMessage.error(`Không thể tải lên tài liệu: ${error.message || 'Lỗi không xác định'}`); // Sử dụng appMessage
    } finally {
      setUploading(false);
    }
  };

  const getStatusTag = (status: KnowledgeEntryStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'PENDING_REVIEW':
        return <Tag color="orange">Chờ duyệt</Tag>;
      case 'REJECTED':
        return <Tag color="red">Từ chối</Tag>;
      case 'DRAFT':
        return <Tag color="default">Bản nháp</Tag>;
      case 'HIDDEN':
        return <Tag color="gray">Đã ẩn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getAccessLevelTag = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'PUBLIC':
        return <Tag color="blue">Công khai</Tag>;
      case 'STUDENT_ONLY':
        return <Tag color="purple">Chỉ sinh viên</Tag>;
      case 'LECTURER_ONLY':
        return <Tag color="geekblue">Chỉ giảng viên</Tag>;
      case 'PRIVATE':
        return <Tag color="red">Riêng tư</Tag>;
      default:
        return <Tag>{accessLevel}</Tag>;
    }
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleTagInputChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Document) => (
        <Space direction="vertical" size={0}>
          <a href={record.fileStorageUrl || '#'} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description.length > 80
                ? record.description.substring(0, 80) + '...'
                : record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'File',
      key: 'file',
      render: (record: Document) => (
        record.fileName && (
          <Space direction="vertical" size={0}>
            <Text strong><FileTextOutlined /> {record.fileName}</Text>
            <Text type="secondary" className="text-xs">
              {formatFileSize(record.fileSize)}
            </Text>
          </Space>
        )
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string) => text || 'Chưa phân loại',
      filters: categories.map(category => ({ text: category.name, value: category.id })),
      onFilter: (value: React.Key | boolean, record: Document) =>
        record.category?.id === value,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (record: Document) => (
        <Space size={[0, 4]} wrap>
          {record.tags.map(tag => (
            <Tag key={tag.id} color="blue">
              {tag.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (accessLevel: AccessLevel, record: Document) => (
        <Space direction="vertical" size={0}>
          {getAccessLevelTag(accessLevel)}
          {record.permissions.length > 0 && (
            <Tooltip title={`Đã chia sẻ với ${record.permissions.length} người dùng`}>
              <Badge count={record.permissions.length} size="small" />
            </Tooltip>
          )}
        </Space>
      ),
      filters: [
        { text: 'Công khai', value: 'PUBLIC' },
        { text: 'Chỉ sinh viên', value: 'STUDENT_ONLY' },
        { text: 'Chỉ giảng viên', value: 'LECTURER_ONLY' },
        { text: 'Riêng tư', value: 'PRIVATE' },
      ],
      onFilter: (value: React.Key | boolean, record: Document) =>
        record.accessLevel === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: KnowledgeEntryStatus) => getStatusTag(status),
      filters: [
        { text: 'Đã duyệt', value: 'APPROVED' },
        { text: 'Chờ duyệt', value: 'PENDING_REVIEW' },
        { text: 'Từ chối', value: 'REJECTED' },
        { text: 'Bản nháp', value: 'DRAFT' },
        { text: 'Đã ẩn', value: 'HIDDEN' },
      ],
      onFilter: (value: React.Key | boolean, record: Document) =>
        record.status === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: Document, b: Document) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space size="small">
          <Tooltip title="Xem tài liệu">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.open(`/document/${record.id}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa trạng thái">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showUpdateModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa tài liệu">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Quản lý tài liệu của tôi</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={navigateUpload}
        >
          Thêm tài liệu mới
        </Button>
      </div>

      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm tài liệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setCategoryFilter(value)}
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setStatusFilter(value)}
          >
            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
            <Select.Option value="PENDING_REVIEW">Chờ duyệt</Select.Option>
            <Select.Option value="REJECTED">Từ chối</Select.Option>
            <Select.Option value="DRAFT">Bản nháp</Select.Option>
            <Select.Option value="HIDDEN">Đã ẩn</Select.Option>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
            <div className="mt-3">Đang tải dữ liệu...</div>
          </div>
        ) : documents.length === 0 ? (
          <Empty description="Không tìm thấy tài liệu nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            pagination={{
              current: pagination?.page || 1,
              pageSize: pagination?.limit || 10,
              total: pagination?.total || 0,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} tài liệu`,
            }}
          />
        )}
      </Card>

      {/* Modal thêm tài liệu mới */}
      <Modal
        title="Thêm tài liệu mới"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Tiêu đề tài liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề', min: 3 }]}
          >
            <Input placeholder="Nhập tiêu đề tài liệu" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả ngắn về tài liệu" />
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="Mức độ truy cập"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ truy cập' }]}
            initialValue="PRIVATE"
          >
            <Select placeholder="Chọn mức độ truy cập">
              <Select.Option value="PUBLIC">Công khai (Tất cả)</Select.Option>
              <Select.Option value="STUDENT_ONLY">Chỉ sinh viên</Select.Option>
              <Select.Option value="LECTURER_ONLY">Chỉ giảng viên</Select.Option>
              <Select.Option value="PRIVATE">Riêng tư (Chỉ bạn)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
          >
            <Select placeholder="Chọn danh mục" allowClear>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tags">
            <Input
              placeholder="Nhập tag và nhấn Enter"
              onKeyPress={handleTagInputChange}
            />
            <div className="mt-2">
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => removeTag(tag)}
                  className="my-1"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.accessLevel !== currentValues.accessLevel
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('accessLevel') === 'STUDENT_ONLY' && (
                <Form.Item label="Chia sẻ đặc biệt">
                  <Form.Item name={['permissions', 'emails']} noStyle>
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Nhập email sinh viên cần chia sẻ"
                      tokenSeparators={[',']}
                    />
                  </Form.Item>

                  <div className="mt-2">
                    <Form.Item
                      name={['permissions', 'deadlineOption']}
                      label="Thời hạn truy cập"
                      initialValue="none"
                    >
                      <Select>
                        <Select.Option value="none">Không giới hạn</Select.Option>
                        <Select.Option value="30d">30 ngày</Select.Option>
                        <Select.Option value="60d">60 ngày</Select.Option>
                        <Select.Option value="90d">90 ngày</Select.Option>
                        <Select.Option value="custom">Tùy chỉnh</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.permissions?.deadlineOption !== currentValues.permissions?.deadlineOption
                      }
                      noStyle
                    >
                      {({ getFieldValue }) =>
                        getFieldValue(['permissions', 'deadlineOption']) === 'custom' && (
                          <Form.Item name={['permissions', 'deadlineDates']} label="Chọn ngày kết thúc">
                            <Input type="date" />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                  </div>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="file"
            label="Tải lên tài liệu"
            rules={[{ required: true, message: 'Vui lòng tải lên tệp tài liệu' }]}
          >
            <Dragger {...uploadProps} fileList={fileList}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo file vào đây để tải lên</p>
              <p className="ant-upload-hint">
                Hỗ trợ tải lên một file duy nhất. Khuyến nghị sử dụng PDF, DOCX, XLSX, PPTX.
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Tải lên tài liệu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật tài liệu"
        open={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={null}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateSubmit}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="APPROVED">
                <CheckCircleOutlined /> Đã duyệt
              </Select.Option>
              <Select.Option value="DRAFT">
                <ClockCircleOutlined /> Bản nháp
              </Select.Option>
              <Select.Option value="HIDDEN">
                <LockOutlined /> Ẩn
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="Mức độ truy cập"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ truy cập' }]}
          >
            <Select placeholder="Chọn mức độ truy cập">
              <Select.Option value="PUBLIC">Công khai (Tất cả)</Select.Option>
              <Select.Option value="STUDENT_ONLY">Chỉ sinh viên</Select.Option>
              <Select.Option value="LECTURER_ONLY">Chỉ giảng viên</Select.Option>
              <Select.Option value="PRIVATE">Riêng tư (Chỉ bạn)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button style={{ marginRight: 8 }} onClick={handleUpdateCancel}>
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Component chính được export, bọc LecturerDocumentsManagementContent trong App
const LecturerDocumentsManagement = () => (
  <App>
    <LecturerDocumentsManagementContent />
  </App>
);

export default LecturerDocumentsManagement;