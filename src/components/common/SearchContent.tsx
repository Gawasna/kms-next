'use client';

import { useState, useEffect } from 'react';
import { Input, Card, List, Tag, Space, Empty, Spin, Typography, Select, Pagination } from 'antd';
import { SearchOutlined, FileTextOutlined, UserOutlined, FolderOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SearchResult {
  id: string;
  title: string;
  description: string;
  author: { name: string; image: string | null };
  category: { name: string };
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  accessLevel?: 'PUBLIC' | 'STUDENT_ONLY' | 'LECTURER_ONLY' | 'PRIVATE';
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  const pageSizeParam = searchParams.get('pageSize') || '10';
  
  const [searchTerm, setSearchTerm] = useState<string>(query);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [page, setPage] = useState<number>(parseInt(pageParam));
  const [pageSize, setPageSize] = useState<number>(parseInt(pageSizeParam));
  
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 500);

  // Update URL with current search parameters
  const updateSearchParams = (params: { q?: string; page?: number; pageSize?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (params.q !== undefined) {
      if (params.q) newParams.set('q', params.q);
      else newParams.delete('q');
    }
    
    if (params.page !== undefined) {
      if (params.page > 1) newParams.set('page', params.page.toString());
      else newParams.delete('page');
    }
    
    if (params.pageSize !== undefined) {
      if (params.pageSize !== 10) newParams.set('pageSize', params.pageSize.toString());
      else newParams.delete('pageSize');
    }
    
    router.push(`/search?${newParams.toString()}`);
  };

  // Handle search from the search box
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (page !== 1) setPage(1);
    else updateSearchParams({ q: value, page: 1 });
  };

  // Handle page change
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      updateSearchParams({ page: newPage, pageSize: newPageSize });
    } else {
      updateSearchParams({ page: newPage });
    }
  };

  // Fetch search results when debounced search term changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`
        );
        
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.results || []);
          setTotalResults(data.totalCount || 0);
        } else {
          console.error('Search error:', data.message);
          setSearchResults([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    // Update URL when debounced search term changes
    if (debouncedSearchTerm !== query) {
      updateSearchParams({ q: debouncedSearchTerm, page: 1 });
    } else {
      fetchSearchResults();
    }
  }, [debouncedSearchTerm, query, page, pageSize]);

  // Update states when URL params change
  useEffect(() => {
    setSearchTerm(query);
    setPage(parseInt(pageParam) || 1);
    setPageSize(parseInt(pageSizeParam) || 10);
  }, [query, pageParam, pageSizeParam]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedResults = searchResults.slice(startIndex, endIndex);

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />
        
        {/* Page size selector */}
        <div className="mt-4 flex justify-end">
          <Space>
            <Text>Hiển thị mỗi trang:</Text>
            <Select
              value={pageSize}
              onChange={(value) => handlePageChange(1, value)}
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15' },
                { value: 20, label: '20' },
              ]}
            />
          </Space>
        </div>
      </Card>
      
      {/* Search results */}
      <Card>
        <div className="mb-4">
          <Text>Có {totalResults} kết quả tìm kiếm</Text>
          {query && <Text> cho "{query}"</Text>}
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
          <>
            <List
              itemLayout="vertical"
              dataSource={paginatedResults}
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
                    
                    <div className="flex flex-col md:flex-row md:justify-between mt-3 text-xs text-gray-500">
                      <Space>
                        <UserOutlined /> {item.author.name}
                        <FolderOutlined /> {item.category.name}
                        <span>Lượt xem: {item.viewsCount}</span>
                      </Space>
                      <Text type="secondary">
                        Cập nhật: {formatDate(item.updatedAt)}
                      </Text>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
            
            {/* Pagination */}
            {totalResults > 0 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={totalResults}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={['5', '10', '15', '20']}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} kết quả`}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}