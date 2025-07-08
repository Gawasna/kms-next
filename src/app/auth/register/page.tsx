// Basic register prototype page with form validation
// Added: 2025-07-02 - Basic registration form using antd library
// TODO: Integrate with actual registration API

'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log('Registration values:', values);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/auth/login'); // Redirect to login after successful registration
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
        <Alert
          message="Registration Successful!"
          description="Your account has been created. Redirecting to login page..."
          type="success"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <Title level={2}>Register</Title>
      {error && (
        <Alert 
          message={error} 
          type="error" 
          closable 
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}
      <Form form={form} name="register" onFinish={onFinish} layout="vertical">
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Please input your username!' },
            { min: 3, message: 'Username must be at least 3 characters!' }
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters!' }
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="link" onClick={() => router.push('/auth/login')} block>
            Already have an account? Login here
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
