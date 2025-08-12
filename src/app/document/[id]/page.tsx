// app/document/[id]/page.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import Link from 'next/link';

// Đây là hàm mock dữ liệu tài liệu của bạn.
// Trong một ứng dụng thực tế, bạn sẽ gọi API backend để lấy thông tin tài liệu.
interface DocumentData {
    id: string;
    title: string;
    type: 'markdown' | 'pdf' | 'word';
    url?: string; // URL cho PDF, Word (hoặc download)
    content?: string; // Nội dung cho Markdown
    message?: string; // Tin nhắn bổ sung cho Word docs
    description?: string;
}

async function getDocumentDetails(id: string): Promise<DocumentData | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    switch (id) {
        case 'report-1':
            return {
                id: 'report-1',
                title: 'Annual Report 2023',
                type: 'pdf',
                url: '/documents/lph.pdf', // Đảm bảo có file sample.pdf trong public/documents/
                description: 'This is the latest annual financial report highlighting company performance.'
            };
        case 'readme':
            return {
                id: 'readme',
                title: 'Project Readme',
                type: 'markdown',
                content: `# KIMS Project Overview\n\nThis document provides an overview of the **Knowledge & Information Management System (KIMS)** project.\n\n## Key Features\n\n-   **Document Upload & Storage**: Securely store various document types.\n-   **Full-text Search**: Quickly find documents using powerful search capabilities.\n-   **Version Control**: Track changes and manage document versions.\n-   **User Permissions**: Granular control over who can access and modify documents.\n\n## Getting Started\n\nTo set up the project locally, follow these steps:\n\n1.  Clone the repository:\n    \`\`\`bash\ngit clone https://github.com/your-org/kims.git\n    \`\`\`\n2.  Install dependencies:\n    \`\`\`bash\ncd kims\nnpm install\n    \`\`\`\n3.  Run the development server:\n    \`\`\`bash\nnpm run dev\n    \`\`\`\n\nFor more details, please refer to the [official documentation](/docs/setup).`,
                description: 'Detailed information about the KIMS project setup and features.'
            };
        case 'minutes-q1':
            return {
                id: 'minutes-q1',
                title: 'Q1 Meeting Minutes',
                type: 'word',
                // Đối với file Word, thường không thể nhúng trực tiếp đẹp như PDF.
                // Các giải pháp phổ biến là:
                // 1. Chuyển đổi sang PDF/HTML ở backend trước khi hiển thị.
                // 2. Sử dụng dịch vụ xem tài liệu bên ngoài (như Google Docs Viewer).
                // 3. Cung cấp link download.
                // Ở đây dùng một link .docx công khai và Google Viewer để minh họa.
                url: 'https://www.africau.edu/images/default/sample.docx', // Một file .docx mẫu công khai
                message: "Word documents are typically viewed via external services or converted to PDF/HTML for in-app viewing. You can use Google Docs Viewer or download the original file.",
                description: 'Minutes from the first quarter\'s strategic meeting, outlining key decisions and action items.'
            };
        case 'presentation-v2':
            return {
                id: 'presentation-v2',
                title: 'Marketing Strategy Presentation',
                type: 'pdf',
                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Một file PDF mẫu công khai khác
                description: 'Presentation slides for the Q2 marketing strategy.'
            };
        default:
            return null;
    }
}

// Metadata động cho từng trang tài liệu
export async function generateMetadata({ params }: { params: { id: string } }) {
    const document = await getDocumentDetails(params.id);

    if (!document) {
        return {
            title: 'Document Not Found | KIMS Next App',
        };
    }

    return {
        title: `${document.title} | KIMS Next App`,
        description: document.description || `View ${document.title} in KIMS Document Management System.`,
    };
}


export default async function DocumentPage({ params }: { params: { id: string } }) {
    const document = await getDocumentDetails(params.id);

    if (!document) {
        return (
            <div className="p-8 text-center text-gray-600">
                <h2 className="text-2xl font-bold mb-4">Document Not Found</h2>
                <p>The document with ID "<span className="font-mono text-blue-600">{params.id}</span>" could not be found.</p>
                <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
                    Go to Homepage
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{document.title}</h1>
            <p className="text-gray-600 mb-6">{document.description}</p>

            <div className="document-viewer border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-[500px] flex flex-col">
                {document.type === 'markdown' && (
                    <div className="prose max-w-none flex-grow overflow-auto"> {/* 'prose' cho styling Markdown */}
                        <ReactMarkdown>{document.content || ''}</ReactMarkdown>
                    </div>
                )}

                {document.type === 'pdf' && document.url && (
                    <div className="w-full flex-grow relative" style={{ height: 'calc(100vh - 200px)' }}> {/* Điều chỉnh chiều cao */}
                        <iframe 
                            src={document.url} 
                            className="absolute inset-0 w-full h-full border-0 rounded-md" 
                            title={document.title}
                            loading="lazy" // Giúp tải iframe lười biếng
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Thêm sandbox cho bảo mật
                        >
                            <p>Your browser does not support iframes. You can <a href={document.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">download the PDF</a> instead.</p>
                        </iframe>
                    </div>
                )}

                {document.type === 'word' && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-700 flex-grow">
                        <p className="mb-4 text-lg font-medium">{document.message}</p>
                        {document.url && (
                            <div className="flex flex-wrap justify-center gap-4">
                                <a 
                                    href={`https://docs.google.com/gview?url=${encodeURIComponent(document.url)}&embedded=true`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition duration-300 ease-in-out"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1-3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                                    View with Google Docs Viewer
                                </a>
                                <a 
                                    href={document.url} 
                                    download 
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg inline-flex items-center transition duration-300 ease-in-out"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download Original Document
                                </a>
                            </div>
                        )}
                    </div>
                )}
                {!document.type && (
                    <div className="p-8 text-center text-gray-500">
                        <p>No viewer available for this document type.</p>
                    </div>
                )}
            </div>
        </div>
    );
}