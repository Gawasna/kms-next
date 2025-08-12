// app/document/layout.tsx
import React from 'react';

export default function DocumentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="document-layout p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200">
                Document Viewer
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {children}
            </div>
        </div>
    );
}