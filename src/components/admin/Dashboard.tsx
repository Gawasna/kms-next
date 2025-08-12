'use client'

import { Card, Col, Row, Statistic, Table, Typography, Spin } from 'antd';
import { UserOutlined, FileOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Session } from 'next-auth';
import ActiveSessions from '@/components/admin/ActiveSessions';
import { useState, useEffect } from 'react';

export default function AdminDashboard({ session }: { session: Session }) {
    const [activeSessionsCount, setActiveSessionsCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveSessionsCount = async () => {
            try {
                const response = await fetch('/api/heartbeat');
                if (response.ok) {
                    const data = await response.json();
                    setActiveSessionsCount(data.totalActive);
                }
            } catch (error) {
                console.error('Failed to fetch active sessions count:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveSessionsCount();
        // Cập nhật số liệu mỗi phút
        const intervalId = setInterval(fetchActiveSessionsCount, 60000);
        
        return () => clearInterval(intervalId);
    }, []);

    const recentActivities = [
        { key: '1', user: 'John Doe', action: 'Updated document', time: '2 minutes ago' },
        { key: '2', user: 'Jane Smith', action: 'Created new folder', time: '1 hour ago' },
        { key: '3', user: 'Mike Johnson', action: 'Shared document', time: '3 hours ago' },
    ];

    const columns = [
        { title: 'User', dataIndex: 'user', key: 'user' },
        { title: 'Action', dataIndex: 'action', key: 'action' },
        { title: 'Time', dataIndex: 'time', key: 'time' },
    ];

    return(
        <div className="p-6">
            
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={256}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Documents"
                            value={1458}
                            prefix={<FileOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Teams"
                            value={32}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                <Spin size="small" />
                            </div>
                        ) : (
                            <Statistic
                                title="Active Sessions"
                                value={activeSessionsCount || 0}
                                prefix={<ClockCircleOutlined />}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Add ActiveSessions component */}
            <ActiveSessions />

            <Card title="Recent Activities" className="mb-6">
                <Table
                    columns={columns}
                    dataSource={recentActivities}
                    pagination={false}
                />
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Quick Actions">
                        <ul className="list-none">
                            <li className="mb-2">👥 Manage Users</li>
                            <li className="mb-2">📁 Document Management</li>
                            <li className="mb-2">⚙️ System Settings</li>
                            <li className="mb-2">📊 View Reports</li>
                        </ul>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="System Status">
                        <ul className="list-none">
                            <li className="mb-2">✅ Server Status: Online</li>
                            <li className="mb-2">✅ Database: Connected</li>
                            <li className="mb-2">✅ Storage: 75% Available</li>
                            <li className="mb-2">✅ API Services: Operational</li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}