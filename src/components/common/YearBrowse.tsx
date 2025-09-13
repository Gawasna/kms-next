'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Spin, Empty, List, Space, Badge, Statistic } from 'antd';
import { CalendarOutlined, FileTextOutlined, FieldTimeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface YearData {
  year: number;
  count: number;
}

export default function YearBrowse() {
  const router = useRouter();
  const [years, setYears] = useState<YearData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);

  // Fetch years
  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/browse/years');
        
        if (!response.ok) {
          throw new Error('Failed to fetch years');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setYears(data.years);
          // Calculate total documents across all years
          const total = data.years.reduce((sum: number, year: YearData) => sum + year.count, 0);
          setTotalDocuments(total);
        } else {
          console.error('Error fetching years:', data.message);
          setYears([]);
        }
      } catch (error) {
        console.error('Error fetching years:', error);
        setYears([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  // Get color for year card based on document count
  const getYearCardColor = (count: number): string => {
    if (count >= 50) return '#f5222d'; // red
    if (count >= 30) return '#fa8c16'; // orange
    if (count >= 20) return '#faad14'; // yellow
    if (count >= 10) return '#52c41a'; // green
    return '#1890ff'; // blue
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Title level={2}>
        <CalendarOutlined className="mr-2" />
        Duyệt theo năm
      </Title>
      
      <Card>
        <div className="mb-6 text-center">
          <Statistic
            title="Tổng số tài liệu"
            value={totalDocuments}
            prefix={<FileTextOutlined />}
          />
          <Text type="secondary">Phân loại theo năm xuất bản</Text>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : years.length === 0 ? (
          <Empty 
            description="Không có dữ liệu năm" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
              xxl: 4,
            }}
            dataSource={years}
            renderItem={(yearData) => (
              <List.Item>
                <Link href={`/browse/year/${yearData.year}`}>
                  <Card 
                    hoverable 
                    className="text-center"
                    style={{ borderTop: `4px solid ${getYearCardColor(yearData.count)}` }}
                  >
                    <Title level={2} style={{ color: getYearCardColor(yearData.count) }}>
                      {yearData.year}
                    </Title>
                    <Space direction="vertical" size={0}>
                      <Badge count={yearData.count} overflowCount={999} style={{ backgroundColor: getYearCardColor(yearData.count) }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#888' }} />
                      </Badge>
                      <Text className="mt-2">{yearData.count} tài liệu</Text>
                    </Space>
                  </Card>
                </Link>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}