// Basic login prototype page with form validation
// Fixed: 2025-07-02 - Integrated useAuth hook for proper authentication handling
// Fixed: 2025-07-02 - Added error handling and improved UX
// Login with ID/Email and password using antd library

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useAuth } from '../../../hooks/useAuth';

const { Title } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    try {
      setError(null);
      await login(values);
      router.push('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <Title level={2}>Login</Title>
      {error && (
        <Alert 
          message={error} 
          type="error" 
          closable 
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}
      <Form form={form} name="login" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username or email!' }]}
        >
          <Input placeholder="Username or Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="link" onClick={() => router.push('/auth/register')} block>
            Don't have an account? Register here
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}