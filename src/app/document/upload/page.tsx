'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Upload, message, Typography, Form, Spin, Tag, Divider } from 'antd';
import { UploadOutlined, SearchOutlined, LoadingOutlined, FileOutlined, TagOutlined, FolderOutlined } from '@ant-design/icons';
import { DocumentAccessSetting } from '@/components/documents/DocumentAccessSetting';
import { useRouter } from 'next/navigation';
import { AccessLevel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import debounce from 'lodash/debounce';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function UploadDocumentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagSearchValue, setTagSearchValue] = useState('');

  const [tagMap, setTagMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      message.error('Bạn cần đăng nhập để tải lên tài liệu');
      router.push('/auth/login');
    } else if (status === 'authenticated' &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'LECTURER') {
      message.error('Bạn không có quyền tải lên tài liệu');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (tagSearchValue.length >= 2) {
      debouncedFetchTags(tagSearchValue);
    }
  }, [tagSearchValue]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchTags = async (query = '') => {
    setIsLoadingTags(true);
    try {
      const url = query ? `/api/tags?q=${encodeURIComponent(query)}` : '/api/tags';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();

      const newTagMap = { ...tagMap };
      data.forEach((tag: Tag) => {
        newTagMap[tag.name.toLowerCase()] = tag.id;
      });
      setTagMap(newTagMap);

      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const debouncedFetchTags = debounce(fetchTags, 500);

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);
  };

  const createNewTag = async (tagName: string) => {
    if (!tagName || tagName.trim() === '') return null;

    try {
      const normalizedTagName = tagName.trim().toLowerCase();

      if (tagMap[normalizedTagName]) {
        return { id: tagMap[normalizedTagName], name: normalizedTagName };
      }

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: normalizedTagName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tag');
      }

      const newTag = await response.json();

      // Update our tag map
      setTagMap(prev => ({
        ...prev,
        [newTag.name.toLowerCase()]: newTag.id
      }));

      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      message.error('Không thể tạo tag mới');
      return null;
    }
  };

const handleSubmit = async (values: any) => {
  if (fileList.length === 0) {
    message.error('Vui lòng chọn file tài liệu để tải lên');
    return;
  }

  setIsLoading(true);

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

    // Xử lý phần quyền truy cập
    if (values.accessLevel === 'STUDENT_ONLY' && values.specificEmails?.length > 0) {
      const permissions = {
        emails: values.specificEmails,
        deadline: {
          option: values.deadlineOption || 'none',
          dates: values.customDeadline 
            ? [values.customDeadline[0].toISOString(), values.customDeadline[1].toISOString()] 
            : null,
        }
      };
      formData.append('permissions', JSON.stringify(permissions));
    }

    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Upload failed:", errorData);
      const errorMessage = errorData.errors ?
        Object.values(errorData.errors.fieldErrors).flat().join(', ') :
        errorData.message;
      throw new Error(errorMessage || 'Tải lên tài liệu thất bại');
    }

    const result = await response.json();
    
    // Hiển thị thông báo về email không tìm thấy (nếu có)
    if (result.notFoundEmails && result.notFoundEmails.length > 0) {
      message.warning(`Một số email không tìm thấy trong hệ thống: ${result.notFoundEmails.join(', ')}`);
    }
    
    message.success('Tài liệu đã được tải lên thành công!');

    form.resetFields();
    setFileList([]);
    setSelectedTags([]);
    setTimeout(() => {
      if (session?.user?.role === 'LECTURER') {
        router.push('/dashboard/lecturer/documents');
      } else {
        router.push('/dashboard/admin');
      }
    }, 2000);

  } catch (error: any) {
    message.error(`Lỗi: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // Handle tag selection change
  const handleTagChange = (values: string[]) => {
    setSelectedTags(values);
  };

  // Handle tag search
  const handleTagSearch = (value: string) => {
    setTagSearchValue(value);
  };

  // Calculate accepted file types based on user role
  const getAcceptedFileTypes = () => {
    if (session?.user?.role === 'ADMIN') {
      return '.doc,.docx,.pdf,.txt,.md,.jpg,.jpeg,.png,.mp4,.mp3,.zip,.rar';
    }
    return '.doc,.docx,.pdf,.txt,.md,.jpg,.jpeg,.png';
  };

  // Preview component for images
  const FilePreview = () => {
    if (fileList.length === 0) return null;

    const file = fileList[0];

    if (file.type?.startsWith('image/')) {
      return (
        <div className="mt-4">
          <img
            src={URL.createObjectURL(file.originFileObj)}
            alt="Preview"
            className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200"
          />
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex items-center">
        <FileOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
        <div>
          <div className="font-medium">{file.name}</div>
          <div className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
          </div>
        </div>
      </div>
    );
  };

  // If still checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <Title level={2} className="mb-2">Tải lên Tài liệu Mới</Title>
        <Text type="secondary">
          Tải lên tài liệu, chọn danh mục, thêm tags và thiết lập quyền truy cập.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          accessLevel: 'PRIVATE' as AccessLevel,
        }}
        requiredMark="optional"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: File Upload & Details */}
          <div className="flex flex-col gap-6">
            <div className="p-6 border border-dashed rounded-lg flex flex-col items-center justify-center min-h-[300px] bg-gray-50">
              <Dragger
                name="file"
                multiple={false}
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false} // Prevent automatic upload
                className="w-full"
                disabled={isLoading}
                accept={getAcceptedFileTypes()}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Kéo thả hoặc nhấn để tải tài liệu</p>
                <p className="ant-upload-hint">
                  {session?.user?.role === 'ADMIN'
                    ? 'Hỗ trợ .doc, .docx, .pdf, .txt, .md, hình ảnh, video, và file nén'
                    : 'Hỗ trợ .doc, .docx, .pdf, .txt, .md và hình ảnh'}
                </p>
              </Dragger>
            </div>

            <FilePreview />

            {fileList.length > 0 && (
              <div className="p-4 border rounded-lg bg-blue-50 text-blue-700">
                <div className="flex items-center">
                  <div className="mr-2">💡</div>
                  <div>
                    <strong>Lưu ý:</strong> File sẽ được lưu trữ an toàn trên hệ thống và chỉ những người có quyền mới có thể truy cập.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Share Settings */}
          <div className="flex flex-col gap-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Thông tin Tài liệu</h3>

              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề tài liệu' },
                  { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input
                  placeholder="Nhập tiêu đề tài liệu"
                  size="large"
                  disabled={isLoading}
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
              >
                <Input.TextArea
                  placeholder="Mô tả ngắn về tài liệu (không bắt buộc)"
                  rows={3}
                  disabled={isLoading}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Divider />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Form.Item
                  name="categoryId"
                  label={
                    <span className="flex items-center">
                      <FolderOutlined className="mr-1" /> Danh mục
                    </span>
                  }
                >
                  <Select
                    placeholder={isLoadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"}
                    style={{ width: '100%' }}
                    disabled={isLoading || isLoadingCategories}
                    loading={isLoadingCategories}
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={isLoadingCategories ? <Spin size="small" /> : "Không tìm thấy danh mục"}
                    allowClear
                  />
                </Form.Item>

                <div className="mb-4">
                  <label htmlFor="tags" className="block text-sm font-medium mb-2 flex items-center">
                    <TagOutlined className="mr-1" /> Tags {isLoadingTags && <LoadingOutlined style={{ marginLeft: 8 }} />}
                  </label>
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Chọn hoặc thêm tags mới"
                    onChange={handleTagChange}
                    value={selectedTags}
                    disabled={isLoading}
                    loading={isLoadingTags}
                    options={tags.map(tag => ({ value: tag.name, label: tag.name }))}
                    onSearch={handleTagSearch}
                    filterOption={false} // Disable client filtering, let the server handle it
                    notFoundContent={
                      isLoadingTags ?
                        <Spin size="small" /> :
                        tagSearchValue.length < 2 ?
                          "Gõ ít nhất 2 ký tự để tìm kiếm" :
                          "Không tìm thấy tag phù hợp"
                    }
                    suffixIcon={<SearchOutlined />}
                    tokenSeparators={[',']}
                    maxTagCount={5}
                    maxTagTextLength={20}
                  />

                  <Text type="secondary" className="mt-1 block text-xs">
                    Gõ ít nhất 2 ký tự để tìm tag. Nhấn Enter để thêm tag mới.
                  </Text>
                </div>
              </div>
            </div>

            {/* Share Settings */}
            <div className="p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quyền truy cập</h3>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.accessLevel !== currentValues.accessLevel}
            >
                {({ getFieldValue }) => (
                    <Form.Item name="accessLevel" noStyle>
                        <DocumentAccessSetting 
                            form={form}
                            currentAccessLevel={getFieldValue('accessLevel')} // Truyền giá trị hiện tại xuống
                        />
                    </Form.Item>
                )}
            </Form.Item>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading || fileList.length === 0}
                icon={<UploadOutlined />}
              >
                {isLoading ? 'Đang xử lý...' : 'Tải lên Tài liệu'}
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
}