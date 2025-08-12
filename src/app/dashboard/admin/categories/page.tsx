"use client";

import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Thay thế bằng API call thực tế của bạn
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("Không thể tải dữ liệu danh mục");
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (record: Category) => {
    setIsEditing(true);
    setCurrentCategory(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEditing && currentCategory) {
        // Update category
        await fetch(`/api/categories/${currentCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        message.success("Cập nhật danh mục thành công");
      } else {
        // Add new category
        await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        message.success("Thêm danh mục thành công");
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      message.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      message.error("Không thể xóa danh mục");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc muốn xóa danh mục này?"
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
          <Title level={2}>Quản lý danh mục</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Thêm danh mục
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={isEditing ? "Sửa danh mục" : "Thêm danh mục mới"}
          open={isModalOpen}
          onCancel={handleCancel}
          onOk={handleSubmit}
          okText={isEditing ? "Cập nhật" : "Thêm mới"}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            name="categoryForm"
          >
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên danh mục!",
                },
              ]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CategoriesPage;