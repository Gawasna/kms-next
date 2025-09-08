'use client';
import { useState, useEffect } from 'react';
import { Button, Input, Table, Tag, Pagination, Spin, Empty } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface Document {
    id: string;
    title: string;
    submittedBy: string;
    submittedDate: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
}

export default function PendingDocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        // Mock data loading
        const fetchDocuments = () => {
            setLoading(true);
            // This would be replaced with an actual API call
            setTimeout(() => {
                const mockData: Document[] = Array.from({ length: 23 }, (_, i) => ({
                    id: `doc-${i + 1}`,
                    title: `Document ${i + 1}`,
                    submittedBy: `User ${Math.floor(Math.random() * 10) + 1}`,
                    submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    category: ['Medical', 'Financial', 'Legal', 'Educational'][Math.floor(Math.random() * 4)],
                    status: 'pending',
                }));
                
                setDocuments(mockData);
                setPagination(prev => ({ ...prev, total: mockData.length }));
                setLoading(false);
            }, 1000);
        };

        fetchDocuments();
    }, []);

    const handleSearch = (value: string) => {
        setSearchText(value);
        // In a real implementation, this would trigger an API call with the search params
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize || prev.pageSize,
        }));
        // In a real implementation, this would trigger an API call with the pagination params
    };

    const handleApprove = (id: string) => {
        // This would be an API call to approve the document
        console.log(`Approving document ${id}`);
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, status: 'approved' } : doc
        ));
    };

    const handleReject = (id: string) => {
        // This would be an API call to reject the document
        console.log(`Rejecting document ${id}`);
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, status: 'rejected' } : doc
        ));
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Document) => (
                <Link href={`/dashboard/admin/documents/${record.id}`}>
                    {text}
                </Link>
            ),
        },
        {
            title: 'Submitted By',
            dataIndex: 'submittedBy',
            key: 'submittedBy',
        },
        {
            title: 'Date',
            dataIndex: 'submittedDate',
            key: 'submittedDate',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color={
                    category === 'Medical' ? 'blue' :
                    category === 'Financial' ? 'green' :
                    category === 'Legal' ? 'orange' : 'purple'
                }>
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={
                    status === 'pending' ? 'gold' :
                    status === 'approved' ? 'green' : 'red'
                }>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Document) => (
                <div className="flex space-x-2">
                    <Link href={`/dashboard/admin/documents/${record.id}`}>
                        <Button 
                            type="primary" 
                            icon={<EyeOutlined />} 
                            size="small"
                        >
                            View
                        </Button>
                    </Link>
                    <Button 
                        type="primary" 
                        icon={<CheckOutlined />} 
                        size="small"
                        onClick={() => handleApprove(record.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={record.status !== 'pending'}
                    >
                        Approve
                    </Button>
                    <Button 
                        danger 
                        icon={<CloseOutlined />} 
                        size="small"
                        onClick={() => handleReject(record.id)}
                        disabled={record.status !== 'pending'}
                    >
                        Reject
                    </Button>
                </div>
            ),
        },
    ];

    const filteredDocuments = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.submittedBy.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchText.toLowerCase())
    );

    const paginatedDocuments = filteredDocuments.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pending Documents</h1>
                <div className="w-1/3">
                    <Input
                        placeholder="Search documents..."
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        value={searchText}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <Empty description="No pending documents found" />
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={paginatedDocuments}
                        rowKey="id"
                        pagination={false}
                        className="mb-4"
                    />
                    <div className="flex justify-end">
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={filteredDocuments.length}
                            onChange={handlePageChange}
                            showSizeChanger
                            showTotal={(total) => `Total ${total} items`}
                        />
                    </div>
                </>
            )}
        </div>
    );
}