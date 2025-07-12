// src/components/ui/Header.tsx
'use client'; // Client Component vì có thể có tương tác với search, language, profile dropdown

import React, { useState } from 'react';
import Link from 'next/link';
import { Input, Button, Dropdown, Space, Avatar, MenuProps, Modal } from 'antd';
import { SearchOutlined, DownOutlined, UserOutlined, BellOutlined, LogoutOutlined, SettingOutlined, CaretDownFilled, CaretUpFilled, UserAddOutlined, BellFilled, GlobalOutlined } from '@ant-design/icons';
import SearchDropdownResults from './SearchDropdownResults';
import { SearchResult } from '@/types/search';

// Mock user data for demonstration
const currentUser = { name: 'Hung Lee', loggedIn: true };

const mockAllResults: SearchResult[] = [
  {
    id: 1,
    title: 'Tài liệu học Next.js từ cơ bản đến nâng cao',
    author: 'Nguyễn Văn A',
    date: '01/07/2025',
    thumbnail: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=NX',
  },
  {
    id: 2,
    title: 'Tài liệu React nâng cao và Hooks',
    author: 'Trần Thị B',
    date: '05/07/2025',
    thumbnail: 'https://via.placeholder.com/40/33FF57/FFFFFF?text=RC',
  },
  {
    id: 3,
    title: 'Hướng dẫn sử dụng Ant Design hiệu quả',
    author: 'Lê Văn C',
    date: '10/07/2025',
    thumbnail: 'https://via.placeholder.com/40/3357FF/FFFFFF?text=AD',
  },
  {
    id: 4,
    title: 'Tài liệu quản lý dự án Agile Scrum',
    author: 'Phạm Thị D',
    date: '15/07/2025',
    thumbnail: 'https://via.placeholder.com/40/FF33E0/FFFFFF?text=AG',
  },
  {
    id: 5,
    title: 'Tài liệu Node.js cơ bản và Express',
    author: 'Nguyễn Văn E',
    date: '20/07/2025',
    thumbnail: 'https://via.placeholder.com/40/33FFF2/FFFFFF?text=ND',
  },
  {
    id: 6,
    title: 'Tài liệu TypeScript cho người mới bắt đầu',
    author: 'Trần Thị F',
    date: '25/07/2025',
    thumbnail: 'https://via.placeholder.com/40/FFEA33/FFFFFF?text=TS',
  },
  {
    id: 7,
    title: 'Giới thiệu về GraphQL và Apollo Client',
    author: 'Võ Văn G',
    date: '28/07/2025',
    thumbnail: 'https://via.placeholder.com/40/8A33FF/FFFFFF?text=GQ',
  },
  {
    id: 8,
    title: 'Cấu trúc dữ liệu và giải thuật trong JavaScript',
    author: 'Hoàng Thị H',
    date: '01/08/2025',
    thumbnail: 'https://via.placeholder.com/40/33FF8A/FFFFFF?text=DS',
  },
];

const languageMenuItems: MenuProps['items'] = [
  {
    key: 'vi',
    label: (
      <span>
        <img
          src="https://flagcdn.com/w40/vn.png"
          alt="Vietnam"
          style={{ width: 20, marginRight: 8 }}
        />
        Tiếng Việt
      </span>
    ),
  },
  {
    key: 'en',
    label: (
      <span>
        <img
          src="https://flagcdn.com/w40/gb.png"
          alt="English"
          style={{ width: 20, marginRight: 8 }}
        />
        English
      </span>
    ),
  },
];

const authMenuItems: MenuProps['items'] = [
  {
    key: 'login',
    label: (
      <Link href="/auth/login">
        Đăng nhập
      </Link>
    ),
    icon: <UserOutlined />,
  },
  {
    key: 'register',
    label: (
      <Link href="/auth/register">
        Đăng ký
      </Link>
    ),
    icon: <UserAddOutlined />,
  },
];

const profileMenuItems: MenuProps['items'] = [
  { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
  { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
  { type: 'divider' },
  { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
];

export default function Header() {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); // State quản lý hiển thị dropdown tìm kiếm
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // State lưu kết quả tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>(''); // State lưu giá trị input tìm kiếm

  const handleDropdownVisibleChange = (visible: boolean) => {
    setIsDropdownOpen(visible);
  };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    console.log('Search Input Change:', value); // Debug 1

    if (value.length >= 2) { // Chỉ tìm kiếm khi có ít nhất 2 ký tự
      // TODO: Trong thực tế, bạn sẽ gọi API tìm kiếm ở đây và cân nhắc dùng Debounce
      const filteredResults = mockAllResults.filter(result =>
        result.title.toLowerCase().includes(value.toLowerCase()) ||
        result.author.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredResults);
      setIsSearchDropdownOpen(true); // Mở dropdown khi có kết quả
      console.log('Results Found, opening dropdown:', filteredResults.length); // Debug 2
    } else {
      setSearchResults([]); // Xóa kết quả nếu input rỗng hoặc quá ngắn
      setIsSearchDropdownOpen(false); // Đóng dropdown
      console.log('Search term too short or empty, closing dropdown.'); // Debug 3
    }
  };

  const onSearch = (value: string) => {
    console.log('Tìm kiếm thực hiện:', value);
    // TODO: Bạn có thể chuyển hướng người dùng đến trang kết quả tìm kiếm đầy đủ ở đây
    // router.push(`/search?q=${encodeURIComponent(value)}`);
    if (value.length === 0) { // Nếu người dùng xóa hết input và nhấn Enter, đóng dropdown
      setIsSearchDropdownOpen(false);
      console.log('Tìm kiếm thực hiện:', value);
    }
  };

  // Hàm xử lý khi dropdown tìm kiếm mở/đóng
  const handleSearchDropdownVisibleChange = (visible: boolean) => {
    // Logic này giúp kiểm soát việc đóng mở dropdown linh hoạt hơn
    // Ví dụ: chỉ đóng nếu searchTerm rỗng hoặc không có kết quả
    console.log('Search Dropdown visibility changed by AntD:', visible); // Debug 4
    if (!visible && (searchTerm === '' || searchResults.length === 0)) {
      setIsSearchDropdownOpen(false);
    } else if (visible && searchTerm.length >= 2) {
      setIsSearchDropdownOpen(true);
    }
    console.log('isSearchDropdownOpen after AntD change:', isSearchDropdownOpen); // Debug 5
  };

  // Hàm xử lý khi click vào một kết quả tìm kiếm trong dropdown
  const handleSearchResultClick = (result: SearchResult) => {
    console.log('Clicked search result:', result);
    // TODO: Trong thực tế, bạn sẽ điều hướng đến trang chi tiết tài liệu
    // router.push(`/documents/${result.id}`);
    setIsSearchDropdownOpen(false); // Đóng dropdown sau khi chọn
    setSearchTerm(''); // Xóa nội dung tìm kiếm
    setSearchResults([]); // Xóa kết quả
  };

  const handleLanguageMenuClick = (e: any) => {
    console.log('Language selected:', e.key);
    switch (e.key) {
      case 'vi':
        modal.warning({
          title: 'Chức năng chưa sẵn sàng',
          content: 'Chức năng chuyển đổi ngôn ngữ hiện chưa được triển khai.',
        });
        break;
      case 'en':
        modal.warning({
          title: 'Feature not available',
          content: 'Language switching feature is not implemented yet.',
        });
        break;
    }
  };

  const handleProfileMenuClick = (e: any) => {
    console.log('Profile action:', e.key);

    if (e.key === 'profile') {
      //router.push('/dashboard/profile'); // dùng next/router
    } else if (e.key === 'settings') {
      //router.push('/dashboard/settings');
    } else if (e.key === 'logout' && currentUser.loggedIn) {
      modal.confirm({
        title: 'Xác nhận đăng xuất',
        content: 'Bạn có chắc chắn muốn đăng xuất không?',
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        onOk: () => {
          console.log('Đăng xuất thành công');
          //set loggedIn to false in your auth context or state
          //router.push('/'); // Redirect to home page after logout
        },
      });
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link href="/">
          <span className="header-logo gradient-logo">
            KIMS
          </span>
        </Link>

        <div className="header-search-bar">
          <Dropdown
            // Điều khiển việc mở/đóng của dropdown tìm kiếm
            open={isSearchDropdownOpen && (searchTerm.length >= 2 || searchResults.length > 0)}
            // Sử dụng dropdownRender để render component tùy chỉnh của bạn
            dropdownRender={() => (
              <SearchDropdownResults
                results={searchResults}
                searchTerm={searchTerm}
                onResultClick={handleSearchResultClick}
              />
            )}
            placement="bottomLeft" // Vị trí của dropdown
            overlayStyle={{ zIndex: 1050 }} // Đảm bảo dropdown nằm trên cùng
            onOpenChange={handleSearchDropdownVisibleChange} // Xử lý khi trạng thái mở/đóng thay đổi
          >
            <Input.Search
              placeholder="Tìm kiếm tài liệu..."
              onSearch={onSearch} // Kích hoạt khi nhấn Enter hoặc click nút search
              onChange={handleSearchInputChange} // Kích hoạt khi nội dung input thay đổi
              value={searchTerm} // Liên kết giá trị input với state
              enterButton={<Button icon={<SearchOutlined />} />}
              size="large"
            />
          </Dropdown>
        </div>

        <nav className="main-nav">
          {currentUser.loggedIn ? (
            <>
              <Button 
                type="text" 
                icon={<BellFilled/>} 
                className="header-icon-button" 
                size='large'
                />
              <Dropdown
                menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
                onOpenChange={handleDropdownVisibleChange}
                trigger={['click', 'hover']}
              >
                <a onClick={(e) => e.preventDefault()} className="header-profile-link">
                  <Space
                    style={{
                      border: '1px solid #ccc',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar icon={<UserOutlined />} />
                    {currentUser.name}
                    {isDropdownOpen ? (
                      <CaretUpFilled style={{ transition: 'transform 0.1s' }} />
                    ) : (
                      <CaretDownFilled style={{ transition: 'transform 0.1s' }} />
                    )}
                  </Space>
                </a>
              </Dropdown>
            </>
          ) : (
            <>
                <Dropdown
                  menu={{ items: authMenuItems }}
                  trigger={['click']}>
                  <Button icon={<UserOutlined />} type="primary" className="header-auth-button" />
                </Dropdown>
            </>
          )}

          <Dropdown menu={{ items: languageMenuItems, onClick: handleLanguageMenuClick }}>
            <a onClick={(e) => e.preventDefault()} className="header-language-link">
              <Space
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <GlobalOutlined />
                Ngôn ngữ
              </Space>
            </a>
          </Dropdown>
        </nav>
      </div>
      {/* Context holder for Ant Design Modal */}
      {contextHolder}
    </header>
    
  );
}