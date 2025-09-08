'use client';

import React from 'react';
import { Card, Col, Row, Statistic, Table } from 'antd';

const dataSource = [
    {
        key: '1',
        document: 'Lecture Notes',
        views: 120,
        downloads: 45,
    },
    {
        key: '2',
        document: 'Assignment 1',
        views: 80,
        downloads: 30,
    },
    {
        key: '3',
        document: 'Project Guidelines',
        views: 150,
        downloads: 60,
    },
];

const columns = [
    {
        title: 'Document',
        dataIndex: 'document',
        key: 'document',
    },
    {
        title: 'Views',
        dataIndex: 'views',
        key: 'views',
    },
    {
        title: 'Downloads',
        dataIndex: 'downloads',
        key: 'downloads',
    },
];

const LecturerStatsPage: React.FC = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Documents" value={15} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Views" value={350} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Downloads" value={135} />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title="Document Statistics">
                        <Table dataSource={dataSource} columns={columns} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LecturerStatsPage;