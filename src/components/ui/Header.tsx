'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Input, Button, Dropdown, Space, Avatar, MenuProps, Modal } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined, SettingOutlined, CaretDownFilled, CaretUpFilled, UserAddOutlined, BellFilled, GlobalOutlined } from '@ant-design/icons';
import SearchDropdownResults from './SearchDropdownResults'; 
import { SearchResult } from '@/types/search';
import s from './styles/Header.module.css'; 
import c from 'clsx';

const currentUser = { name: 'Hung Lee', loggedIn: false, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HungLee' };

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
  // State để quản lý trạng thái mở/đóng của dropdown profile
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal(); // Hook của Ant Design cho Modal

  // State cho chức năng tìm kiếm
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); // Quản lý hiển thị dropdown tìm kiếm
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // Lưu kết quả tìm kiếm
  const [searchTerm, setSearchTerm] = useState<string>(''); // Lưu giá trị của input tìm kiếm

  // Hàm xử lý khi dropdown profile thay đổi trạng thái hiển thị
  const handleProfileDropdownVisibleChange = (visible: boolean) => {
    setIsProfileDropdownOpen(visible);
  };

  // Hàm xử lý khi input tìm kiếm thay đổi
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) { // Chỉ tìm kiếm khi có ít nhất 2 ký tự
      // TODO: Trong thực tế, bạn sẽ gọi API tìm kiếm ở đây và cân nhắc dùng Debounce
      const filteredResults = mockAllResults.filter(result =>
        result.title.toLowerCase().includes(value.toLowerCase()) ||
        result.author.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredResults);
      // Mở dropdown chỉ khi có kết quả và term đủ dài
      setIsSearchDropdownOpen(filteredResults.length > 0);
    } else {
      setSearchResults([]); // Xóa kết quả nếu input rỗng hoặc quá ngắn
      setIsSearchDropdownOpen(false); // Đóng dropdown
    }
  };

  // Hàm xử lý khi người dùng nhấn Enter hoặc click nút tìm kiếm
  const onSearch = (value: string) => {
    console.log('Tìm kiếm thực hiện:', value);
    // TODO: Bạn có thể chuyển hướng người dùng đến trang kết quả tìm kiếm đầy đủ ở đây
    // router.push(`/search?q=${encodeURIComponent(value)}`);
    setIsSearchDropdownOpen(false); // Đóng dropdown sau khi tìm kiếm chính thức
  };

  // Hàm xử lý khi dropdown tìm kiếm mở/đóng bởi AntD (ví dụ: click ra ngoài)
  const handleSearchDropdownVisibleChange = (visible: boolean) => {
    if (!visible) {
      setIsSearchDropdownOpen(false);
    }
    };

  // Hàm xử lý khi click vào một kết quả tìm kiếm trong dropdown
  const handleSearchResultClick = (result: SearchResult) => {
    console.log('Clicked search result:', result);
    // TODO: Trong thực tế, bạn sẽ điều hướng đến trang chi tiết tài liệu
    // router.push(`/documents/${result.id}`);
    setIsSearchDropdownOpen(false);
    setSearchTerm(result.title);
    setSearchResults([]);
  };

  // Hàm xử lý khi chọn ngôn ngữ
  const handleLanguageMenuClick = (e: any) => {
    console.log('Language selected:', e.key);
    modal.warning({
      title: 'Chức năng chưa sẵn sàng',
      content: 'Chức năng chuyển đổi ngôn ngữ hiện chưa được triển khai.',
    });
  };

  // Hàm xử lý các hành động trong menu profile/auth
  const handleProfileMenuClick = (e: any) => {
    console.log('Profile action:', e.key);

    if (e.key === 'profile') {
      // Ví dụ: router.push('/dashboard/profile');
    } else if (e.key === 'settings') {
      // Ví dụ: router.push('/dashboard/settings');
    } else if (e.key === 'logout' && currentUser.loggedIn) {
      modal.confirm({
        title: 'Xác nhận đăng xuất',
        content: 'Bạn có chắc chắn muốn đăng xuất không?',
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        onOk: () => {
          console.log('Đăng xuất thành công');
          // TODO: Thực tế: cập nhật trạng thái đăng nhập, xóa token, chuyển hướng
          // Ví dụ: setLoggedIn(false); router.push('/');
        },
      });
    }
  };

  return (
    <header className={s['main-header']}>
      {contextHolder}

      {/* Logo Section */}
      <div className={c(s['logo'],s['gradient-logo'])}>
        <Link href="/" className={s.logo}>
          KMS
        </Link>
      </div>

      {/* Search Bar Section */}
      <div className={s['search-section']}>
        <Dropdown
          popupRender={() => (
            <SearchDropdownResults results={searchResults} onResultClick={handleSearchResultClick} searchTerm={''} />
          )}
          open={isSearchDropdownOpen && searchResults.length > 0}
          trigger={['click']}
          onOpenChange={handleSearchDropdownVisibleChange}
          placement="bottomLeft" 
          getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
        >
          <Input.Search
            placeholder="Tìm kiếm tài liệu..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onSearch={onSearch}
            className={s['search-input']}
            onFocus={() => {
              if (searchTerm.length >= 2 && searchResults.length > 0) {
                setIsSearchDropdownOpen(true);
              }
            }}
          />
        </Dropdown>
      </div>

      {/* Right-hand Actions: Notifications, Language, Profile/Auth */}
      <div className={s['header-actions']}>
        <Button type="text" icon={<BellFilled style={{ fontSize: '18px' }} />} />
        <Dropdown
          menu={{ items: languageMenuItems, onClick: handleLanguageMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<GlobalOutlined style={{ fontSize: '18px' }} />} />
        </Dropdown>

        {/* Profile/Auth Section */}
        {currentUser.loggedIn ? (
          <Dropdown
            menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
            placement="bottomRight"
            trigger={['click']}
            onOpenChange={handleProfileDropdownVisibleChange}
          >
            <a onClick={(e) => e.preventDefault()} className={s['profile-dropdown-trigger']}>
              <Avatar icon={<UserOutlined />} src={currentUser.avatarUrl} />
              <span className={s.username}>{currentUser.name}</span>
              <Space>
                <CaretDownFilled className={c(s['dropdown-icon'], { [s.open]: isProfileDropdownOpen })} />
              </Space>
            </a>
          </Dropdown>
        ) : (
          <Dropdown
            menu={{ items: authMenuItems, onClick: handleProfileMenuClick }}
            placement="bottomRight"
            trigger={['click']}
            onOpenChange={handleProfileDropdownVisibleChange}
          >
            <Button type="primary" icon={<UserOutlined />}/>
          </Dropdown>
        )}
      </div>
    </header>
  );
}