"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Card,
  Typography,
  Badge,
  Tag as AntTag,
  Tooltip,
  Divider,
  Input as AntInput,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  TagOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Search } = AntInput;

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { data: session } = useSession();
  const router = useRouter();
  
  // Check if user is authorized
  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
      message.error("Bạn không có quyền truy cập trang này");
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetchTags();
  }, []);
  
  useEffect(() => {
    // Debounce search to avoid excessive API calls
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      fetchTags(searchValue);
    }, 500);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchValue]);

  const fetchTags = async (query = "") => {
    setLoading(true);
    try {
      const url = query && query.length >= 2 
        ? `/api/tags?q=${encodeURIComponent(query)}` 
        : '/api/tags';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      message.error("Không thể tải danh sách tag");
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setCurrentTag(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record: Tag) => {
    setIsEditing(true);
    setCurrentTag(record);
    form.setFieldsValue({
      name: record.name,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing && currentTag) {
        // Update tag
        const response = await fetch(`/api/tags/${currentTag.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        message.success("Cập nhật tag thành công");
      } else {
        // Add new tag
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        message.success("Thêm tag thành công");
      }
      
      setIsModalOpen(false);
      fetchTags();
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Thao tác không thành công"
          : "Thao tác không thành công"
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      message.success("Xóa tag thành công");
      fetchTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      message.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Không thể xóa tag"
          : "Không thể xóa tag"
      );
    }
  };

  const columns = [
    {
      title: "Tên tag",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <AntTag color="blue">
          <TagOutlined /> {text}
        </AntTag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Tag) => (
        <Space size="middle">
          <Tooltip title="Sửa tag">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Popconfirm
            title="Xóa tag"
            description="Bạn có chắc muốn xóa tag này? Tag đang được sử dụng trong tài liệu sẽ không thể xóa."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2}>
              <TagOutlined /> Quản lý tags
            </Title>
            <Text type="secondary">
              Quản lý các tag được sử dụng để phân loại tài liệu trong hệ thống
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Thêm tag mới
          </Button>
        </div>

        <Divider />

        <div className="mb-4 flex items-center justify-between">
          <div className="w-1/2">
            <Search
              placeholder="Tìm kiếm tag (nhập ít nhất 2 ký tự)"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              setSearchValue("");
              fetchTags();
            }}
          >
            Tải lại
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="mb-4">
            <Text>Hiển thị {tags.length} tag</Text>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          locale={{ 
            emptyText: searchValue 
              ? 'Không tìm thấy tag nào phù hợp' 
              : 'Chưa có tag nào trong hệ thống' 
          }}
        />

        <Modal
          title={isEditing ? "Sửa tag" : "Thêm tag mới"}
          open={isModalOpen}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={isEditing ? "Cập nhật" : "Thêm mới"}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            name="tagForm"
          >
            <Form.Item
              name="name"
              label="Tên tag"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên tag!",
                },
                {
                  min: 2,
                  message: "Tên tag phải có ít nhất 2 ký tự!",
                },
                {
                  max: 50,
                  message: "Tên tag không được vượt quá 50 ký tự!",
                },
              ]}
            >
              <Input 
                placeholder="Nhập tên tag" 
                prefix={<TagOutlined />}
                autoFocus
              />
            </Form.Item>
            
            {isEditing && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <Text type="secondary">
                  <InfoCircleOutlined /> Lưu ý: Việc thay đổi tên tag sẽ ảnh hưởng đến tất cả tài liệu đã sử dụng tag này.
                </Text>
              </div>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default TagsPage;