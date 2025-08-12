'use client'

import React, { useState, useEffect } from "react";
import { Table, Button, Typography, Space, Card, Popconfirm, message, Tag, Select, Spin } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { Option } = Select;

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    emailVerified: Date | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    lastActive: string | null;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const router = useRouter();

    const fetchUsers = async (role?: string) => {
        setLoading(true);
        try {
            const url = role ? `/api/users?role=${role}` : '/api/users';
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            
            const data = await response.json();
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(roleFilter || undefined);
    }, [roleFilter]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }
            
            message.success('User deleted successfully');
            // Refresh the list after deletion
            fetchUsers(roleFilter || undefined);
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error(error instanceof Error ? error.message : 'Failed to delete user');
        }
    };

    const handleChangeRole = async (id: string, currentRole: string) => {
        // Define the next role in the cycle
        let newRole: string;
        
        switch (currentRole) {
            case 'ADMIN':
                newRole = 'STUDENT'; // Admin can only be changed to student (though API will prevent this)
                break;
            case 'STUDENT':
                newRole = 'LECTURER';
                break;
            case 'LECTURER':
                newRole = 'STUDENT';
                break;
            case 'GUEST_ROLE':
                newRole = 'STUDENT';
                break;
            default:
                newRole = 'STUDENT';
        }
        
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user role');
            }
            
            message.success('User role updated successfully');
            // Refresh the list after role change
            fetchUsers(roleFilter || undefined);
        } catch (error) {
            console.error('Error updating user role:', error);
            message.error(error instanceof Error ? error.message : 'Failed to update user role');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'red';
            case 'LECTURER':
                return 'blue';
            case 'STUDENT':
                return 'green';
            case 'GUEST_ROLE':
                return 'gray';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string | null) => name || 'Not provided',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={getRoleColor(role)}>{role}</Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            key: 'lastActive',
            render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'Never',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
                <Space size="middle">
                    {record.role !== 'ADMIN' && (
                        <Popconfirm
                            title="Delete user"
                            description="Are you sure you want to delete this user?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                    {record.role !== 'ADMIN' && (
                        <Button
                            onClick={() => handleChangeRole(record.id, record.role)}
                            type="default"
                        >
                            Change Role
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>Users Management</Title>
                <Space>
                    <Select
                        placeholder="Filter by role"
                        allowClear
                        style={{ width: 200 }}
                        onChange={(value) => setRoleFilter(value)}
                    >
                        <Option value="ADMIN">Admin</Option>
                        <Option value="LECTURER">Lecturer</Option>
                        <Option value="STUDENT">Student</Option>
                        <Option value="GUEST_ROLE">Guest</Option>
                    </Select>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => fetchUsers(roleFilter || undefined)}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center p-10">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={users.map(user => ({ ...user, key: user.id }))}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'No users found' }}
                        rowKey="id"
                    />
                )}
            </Card>
        </div>
    );
}