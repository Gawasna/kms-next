'use client';

import { useState, useEffect } from 'react';
import { Input, Card, List, Tag, Space, Empty, Spin, Typography, Select, Divider } from 'antd';
import { SearchOutlined, FileTextOutlined, UserOutlined, TagOutlined, FolderOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SearchResult {
  id: string;
  title: string;
  description: string;
  authorName: string;
  categoryName: string;
  createdAt: string;
  tags: { id: string; name: string; color: string }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  accessLevel: 'PUBLIC' | 'STUDENT_ONLY' | 'LECTURER_ONLY' | 'PRIVATE';
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [tags, setTags] = useState<{id: string, name: string}[]>([]);

  // Simulate search functionality
  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('tag', value);
    } else {
      params.delete('tag');
    }
    router.push(`/search?${params.toString()}`);
  };

  // Mock data fetch
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call like:
        // const response = await fetch(`/api/search?q=${query}&category=${category}&tag=${tag}`);
        // const data = await response.json();
        
        // For demo, we'll use mock data
        setTimeout(() => {
          const mockResults: SearchResult[] = [
            {
              id: '1',
              title: 'Introduction to JavaScript',
              description: 'A comprehensive guide to JavaScript fundamentals for beginners.',
              authorName: 'John Doe',
              categoryName: 'Programming',
              createdAt: '2025-08-15T10:30:00Z',
              tags: [
                { id: '1', name: 'JavaScript', color: 'blue' },
                { id: '2', name: 'Frontend', color: 'green' }
              ],
              status: 'APPROVED',
              accessLevel: 'PUBLIC'
            },
            {
              id: '2',
              title: 'React Hooks Tutorial',
              description: 'Learn how to use React Hooks effectively in your applications.',
              authorName: 'Jane Smith',
              categoryName: 'Web Development',
              createdAt: '2025-08-10T14:20:00Z',
              tags: [
                { id: '3', name: 'React', color: 'cyan' },
                { id: '4', name: 'Hooks', color: 'purple' }
              ],
              status: 'APPROVED',
              accessLevel: 'STUDENT_ONLY'
            },
            {
              id: '3',
              title: 'Advanced Database Design',
              description: 'Explore complex database design patterns and optimization techniques.',
              authorName: 'Robert Johnson',
              categoryName: 'Database',
              createdAt: '2025-07-28T09:15:00Z',
              tags: [
                { id: '5', name: 'SQL', color: 'orange' },
                { id: '6', name: 'NoSQL', color: 'red' }
              ],
              status: 'APPROVED',
              accessLevel: 'LECTURER_ONLY'
            }
          ];

          // Filter by search query if provided
          let filteredResults = mockResults;
          if (query) {
            filteredResults = mockResults.filter(result => 
              result.title.toLowerCase().includes(query.toLowerCase()) || 
              result.description.toLowerCase().includes(query.toLowerCase())
            );
          }

          // Filter by category if provided
          if (category) {
            filteredResults = filteredResults.filter(result => 
              result.categoryName.toLowerCase() === category.toLowerCase()
            );
          }

          // Filter by tag if provided
          if (tag) {
            filteredResults = filteredResults.filter(result => 
              result.tags.some(t => t.name.toLowerCase() === tag.toLowerCase())
            );
          }

          setSearchResults(filteredResults);
          
          // Mock categories and tags for filters
          setCategories([
            { id: '1', name: 'Programming' },
            { id: '2', name: 'Web Development' },
            { id: '3', name: 'Database' }
          ]);
          
          setTags([
            { id: '1', name: 'JavaScript' },
            { id: '2', name: 'Frontend' },
            { id: '3', name: 'React' },
            { id: '4', name: 'Hooks' },
            { id: '5', name: 'SQL' },
            { id: '6', name: 'NoSQL' }
          ]);
          
          setLoading(false);
        }, 800); // Simulate network delay
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category, tag]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Access level badge
  const getAccessLevelTag = (level: string) => {
    switch (level) {
      case 'PUBLIC':
        return <Tag color="green">Công khai</Tag>;
      case 'STUDENT_ONLY':
        return <Tag color="blue">Sinh viên</Tag>;
      case 'LECTURER_ONLY':
        return <Tag color="purple">Giảng viên</Tag>;
      case 'PRIVATE':
        return <Tag color="red">Riêng tư</Tag>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>Tìm kiếm tài liệu</Title>
      
      {/* Search input */}
      <Card className="mb-6">
        <Search
          placeholder="Tìm kiếm tài liệu..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          defaultValue={query}
          onSearch={handleSearch}
        />
        
        <Divider className="my-4" />
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <Text strong>Danh mục:</Text>
            <Select
              allowClear
              placeholder="Chọn danh mục"
              style={{ width: '100%', marginTop: '8px' }}
              value={category || undefined}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </div>
          
          <div className="w-full md:w-1/2">
            <Text strong>Thẻ:</Text>
            <Select
              allowClear
              placeholder="Chọn thẻ"
              style={{ width: '100%', marginTop: '8px' }}
              value={tag || undefined}
              onChange={handleTagChange}
            >
              {tags.map((t) => (
                <Option key={t.id} value={t.name}>{t.name}</Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      
      {/* Search results */}
      <Card>
        <div className="mb-4">
          <Text>Có {searchResults.length} kết quả tìm kiếm</Text>
          {query && <Text> cho "{query}"</Text>}
          {category && <Text> trong danh mục "{category}"</Text>}
          {tag && <Text> với thẻ "{tag}"</Text>}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : searchResults.length === 0 ? (
          <Empty 
            description="Không tìm thấy tài liệu nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                className="border-b last:border-b-0 hover:bg-gray-50 rounded-md p-4"
              >
                <Link href={`/document/${item.id}`} className="block">
                  <Title level={4} className="mb-2 text-blue-600 hover:underline">
                    <FileTextOutlined className="mr-2" />
                    {item.title}
                  </Title>
                  
                  <Text type="secondary" className="block mb-3">
                    {item.description}
                  </Text>
                  
                  <Space size={[0, 8]} wrap className="mb-2">
                    {getAccessLevelTag(item.accessLevel)}
                    {item.tags.map((tag) => (
                      <Tag color={tag.color} key={tag.id}>{tag.name}</Tag>
                    ))}
                  </Space>
                  
                  <div className="flex flex-col md:flex-row md:justify-between mt-3 text-xs text-gray-500">
                    <Space>
                      <UserOutlined /> {item.authorName}
                      <FolderOutlined /> {item.categoryName}
                    </Space>
                    <Text type="secondary">
                      Ngày tạo: {formatDate(item.createdAt)}
                    </Text>
                  </div>
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}