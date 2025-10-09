'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Spin } from 'antd';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'NOTI' | 'BANNER';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationBox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        setError(null);
        
        // Specifically request NOTI type notifications by adding type query parameter
        const response = await fetch('/api/notifications?type=NOTI');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="notification-box p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex justify-center items-center h-40">
          <Spin tip="Loading notifications..." fullscreen />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-box p-4 border rounded-lg bg-white shadow-sm">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notification-box p-4 border rounded-lg bg-white shadow-sm">
        <Alert
          message="No notifications"
          description="There are no notifications at this time."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="notification-box p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
      
      {/* Display regular notifications */}
      <ul className="space-y-2 list-disc list-inside">
        {notifications.map(notification => (
          <li key={notification.id} className="text-gray-700">
            <span style={{ fontWeight: "bold" }} className="font-medium">{notification.title}</span>
            {notification.content && (
              <p className="ml-5 text-sm text-gray-600">{notification.content}
                <p
                  className="text-xs text-gray-500 ml-5"
                  style={{
                    fontStyle: "italic",
                    fontSize: "0.8em",
                    textAlign: "end"
                  }}
                >
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}