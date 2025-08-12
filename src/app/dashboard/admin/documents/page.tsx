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
  Upload, 
  message,
  Spin,
  Empty 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  InboxOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { AccessLevel } from '@prisma/client';

const { Title } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

// Type definitions based on your API
interface Document {
  id: string;
  title: string;
  description: string | null;
  accessLevel: AccessLevel;
  status: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  fileStorageUrl: string | null;
  fileName: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryId: string | null;
  author: {
    name: string | null;
    image: string | null;
  };
  category: {
    name: string;
  } | null;
  tags: {
    name: string;
  }[];
}

interface Category {
  id: string;
  name: string;
}

const DocumentsManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<{email: string, expiresInDays?: number}[]>([]);

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to load documents');
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
      message.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this document?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete document');
          }
          
          message.success('Document deleted successfully');
          fetchDocuments(); // Refresh the document list
        } catch (error) {
          console.error('Error deleting document:', error);
          message.error('Failed to delete document');
        }
      },
    });
  };

  const showModal = () => {
    form.resetFields();
    setFileList([]);
    setSelectedTags([]);
    setSelectedPermissions([]);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please upload a file');
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
      
      if (selectedPermissions.length > 0) {
        formData.append('permissions', JSON.stringify(selectedPermissions));
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      message.success('Document uploaded successfully');
      setIsModalVisible(false);
      fetchDocuments(); // Refresh the document list
    } catch (error) {
      console.error('Error uploading document:', error);
      message.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Tag color="green">APPROVED</Tag>;
      case 'PENDING_REVIEW':
        return <Tag color="orange">PENDING REVIEW</Tag>;
      case 'REJECTED':
        return <Tag color="red">REJECTED</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getAccessLevelTag = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case 'PUBLIC':
        return <Tag color="blue">PUBLIC</Tag>;
      case 'STUDENT_ONLY':
        return <Tag color="purple">STUDENT ONLY</Tag>;
      case 'LECTURER_ONLY':
        return <Tag color="geekblue">LECTURER ONLY</Tag>;
      case 'PRIVATE':
        return <Tag color="red">PRIVATE</Tag>;
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

  const addPermission = () => {
    const email = form.getFieldValue('permissionEmail');
    const expiresInDays = form.getFieldValue('expiresInDays');
    
    if (email && /\S+@\S+\.\S+/.test(email)) {
      const newPermission = { 
        email, 
        ...(expiresInDays ? { expiresInDays: Number(expiresInDays) } : {})
      };
      
      setSelectedPermissions([...selectedPermissions, newPermission]);
      form.setFieldsValue({ permissionEmail: '', expiresInDays: undefined });
    } else {
      message.error('Please enter a valid email address');
    }
  };

  const removePermission = (email: string) => {
    setSelectedPermissions(selectedPermissions.filter(p => p.email !== email));
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: Document, b: Document) => a.title.localeCompare(b.title),
      render: (text: string, record: Document) => (
        <a href={record.fileStorageUrl || '#'} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Author',
      dataIndex: ['author', 'name'],
      key: 'author',
      render: (text: string, record: Document) => text || 'Unknown',
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string) => text || 'Uncategorized',
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (record: Document) => (
        <>
          {record.tags.map(tag => (
            <Tag key={tag.name} color="blue">
              {tag.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Access Level',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      render: (accessLevel: AccessLevel) => getAccessLevelTag(accessLevel),
      filters: [
        { text: 'Public', value: 'PUBLIC' },
        { text: 'Student Only', value: 'STUDENT_ONLY' },
        { text: 'Lecturer Only', value: 'LECTURER_ONLY' },
        { text: 'Private', value: 'PRIVATE' },
      ],
      onFilter: (value: string, record: Document) => record.accessLevel === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Pending Review', value: 'PENDING_REVIEW' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: string, record: Document) => record.status === value,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Document, b: Document) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => window.open(record.fileStorageUrl || '#', '_blank')}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchText.toLowerCase())) ||
    (doc.author.name && doc.author.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Documents Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          Add Document
        </Button>
      </div>

      <Card className="mb-6">
        <div className="mb-4">
          <Input
            placeholder="Search documents..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
            <div className="mt-3">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          <Empty description="No documents found" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="Add New Document"
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
            label="Document Title"
            rules={[{ required: true, message: 'Please enter document title', min: 3 }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter document description" />
          </Form.Item>
          
          <Form.Item
            name="accessLevel"
            label="Access Level"
            rules={[{ required: true, message: 'Please select access level' }]}
          >
            <Select placeholder="Select access level">
              <Select.Option value="PUBLIC">Public</Select.Option>
              <Select.Option value="STUDENT_ONLY">Student Only</Select.Option>
              <Select.Option value="LECTURER_ONLY">Lecturer Only</Select.Option>
              <Select.Option value="PRIVATE">Private</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Category"
          >
            <Select placeholder="Select category" allowClear>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tags">
            <Input 
              placeholder="Type a tag and press Enter"
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

          <Form.Item label="Special Permissions">
            <Space className="mb-2">
              <Form.Item name="permissionEmail" noStyle>
                <Input placeholder="Email address" />
              </Form.Item>
              <Form.Item name="expiresInDays" noStyle>
                <Input placeholder="Expires in days (optional)" type="number" />
              </Form.Item>
              <Button onClick={addPermission}>Add</Button>
            </Space>
            <div>
              {selectedPermissions.map(permission => (
                <Tag 
                  key={permission.email} 
                  closable 
                  onClose={() => removePermission(permission.email)}
                  className="my-1"
                >
                  {permission.email} {permission.expiresInDays ? `(${permission.expiresInDays} days)` : ''}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="file"
            label="Upload Document"
            rules={[{ required: true, message: 'Please upload a document file' }]}
          >
            <Dragger {...uploadProps} fileList={fileList}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single file upload. PDF, DOCX, XLSX, PPTX files are recommended.
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={uploading}
                disabled={fileList.length === 0}
              >
                Upload Document
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentsManagement;