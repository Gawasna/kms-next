//Trang thông báo lỗi truy cập
// nhận thông tin từ URL và hiển thị thông báo lỗi
'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
export default function AccessDeniedPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || 'Bạn không có quyền truy cập vào trang này.';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h1>
                <p className="text-gray-700 mb-6">{message}</p>
                <a href="/dashboard" className="text-blue-500 hover:underline">
                    Quay lại trang quản lý
                </a>
            </div>
        </div>
    );
}
