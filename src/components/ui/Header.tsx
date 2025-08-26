'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input, Button, Dropdown, Space, Avatar, MenuProps, Modal, message } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined, SettingOutlined, CaretDownFilled, CaretUpFilled, UserAddOutlined, BellFilled, GlobalOutlined, UploadOutlined, DashboardOutlined } from '@ant-design/icons';
import SearchDropdownResults from './SearchDropdownResults';
import { SearchResult } from '@/types/search';
import s from './styles/Header.module.css';
import c from 'clsx';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce'; // You'll need to create this hook

// Language menu items (unchanged)
const languageMenuItems: MenuProps['items'] = [
  {
    key: 'vi',
    label: (
      <span>
        <img src="https://flagcdn.com/w40/vn.png" alt="Vietnam" style={{ width: 20, marginRight: 8 }} />
        Tiếng Việt
      </span>
    ),
  },
  {
    key: 'en',
    label: (
      <span>
        <img src="https://flagcdn.com/w40/gb.png" alt="English" style={{ width: 20, marginRight: 8 }} />
        English
      </span>
    ),
  },
];

const authMenuItems: MenuProps['items'] = [
  {
    key: 'login',
    label: (<Link href="/auth/login">Đăng nhập</Link>),
    icon: <UserOutlined />,
  },
  {
    key: 'register',
    label: (<Link href="/auth/register">Đăng ký</Link>),
    icon: <UserAddOutlined />,
  },
];

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoggedIn = status === 'authenticated';
  const isLoadingSession = status === 'loading';

  const isLecturer = session?.user?.role === 'LECTURER';
  const isAdmin = session?.user?.role === 'ADMIN';

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term to avoid making API calls on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle profile dropdown visibility
  const handleProfileDropdownVisibleChange = (visible: boolean) => {
    setIsProfileDropdownOpen(visible);
  };

  // Fetch search results when debounced search term changes
  React.useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();

        if (data.success) {
          // Transform API results to match SearchResult type
          const formattedResults: SearchResult[] = data.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            author: item.author?.name || 'Unknown',
            date: new Date(item.updatedAt || item.createdAt).toLocaleDateString('vi-VN'),
            thumbnail: item.author?.image || `https://via.placeholder.com/40/3357FF/FFFFFF?text=${item.author?.name?.charAt(0) || 'U'}`
          }));

          setSearchResults(formattedResults);
          setIsSearchDropdownOpen(formattedResults.length > 0);
        } else {
          message.error(data.message || 'Error searching for documents');
          setSearchResults([]);
          setIsSearchDropdownOpen(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        message.error('Failed to search for documents');
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length < 2) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };

  const onSearch = (value: string) => {
    if (value.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
      setIsSearchDropdownOpen(false);
    }
  };

  const handleSearchDropdownVisibleChange = (visible: boolean) => {
    if (!visible) {
      setIsSearchDropdownOpen(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    router.push(`/document/${result.id}`);
    setIsSearchDropdownOpen(false);
    setSearchTerm('');  // Clear search term after clicking
    setSearchResults([]);
  };

  const handleLanguageMenuClick = (e: any) => {
    console.log('Language selected:', e.key);
    modal.warning({
      title: 'Chức năng chưa sẵn sàng',
      content: 'Chức năng chuyển đổi ngôn ngữ hiện chưa được triển khai.',
    });
  };

  // Profile menu items based on session state
  const profileMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
    ...(isLecturer || isAdmin ? [
      { key: 'upload', label: 'Tải lên tài liệu', icon: <UploadOutlined /> }
    ] : []),
    { type: 'divider' },
    ...(isLecturer || isAdmin ? [
      { key: 'dashboard', label: 'Bảng điều khiển', icon: <DashboardOutlined /> }
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        modal.confirm({
          title: 'Xác nhận đăng xuất',
          content: 'Bạn có chắc chắn muốn đăng xuất không?',
          okText: 'Đồng ý',
          cancelText: 'Hủy',
          onOk: async () => {
            await signOut({ callbackUrl: '/' });
          },
        });
      }
    },
  ];

  const handleProfileMenuClick = (e: any) => {
    if (e.key === 'profile') {
      router.push('/profile');
    } else if (e.key === 'settings') {
      router.push('/dashboard/settings');
    } else if (e.key === 'upload') {
      router.push('/document/upload');
    } else if (e.key === 'dashboard') {
      if (isAdmin) {
        router.push('/dashboard/admin');
      } else if (isLecturer) {
        router.push('/dashboard/lecturer');
      }
    }
  };

  return (
    <header className={s['main-header']}>
      {contextHolder}

      {/* Logo Section */}
      <div className={c(s['logo'], s['gradient-logo'])}>
        <Link href="/" className={s.logo}>
          KMS
        </Link>
      </div>

      {/* Search Bar Section */}
      <div className={s['search-section']}>
        <Dropdown
          popupRender={() => (
            <SearchDropdownResults
              results={searchResults}
              onResultClick={handleSearchResultClick}
              searchTerm={searchTerm}
            />
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
            disabled={isLoadingSession}
            loading={isSearching}
          />
        </Dropdown>
      </div>

      {/* Right-hand Actions: Notifications, Language, Profile/Auth */}
      <div className={s['header-actions']}>
        {/* Disable notifications or show skeleton while session is loading */}
        <Button type="text" icon={<BellFilled style={{ fontSize: '18px' }} />} disabled={isLoadingSession} />
        <Dropdown
          menu={{ items: languageMenuItems, onClick: handleLanguageMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          {/* Disable language selector while session is loading */}
          <Button type="text" icon={<GlobalOutlined style={{ fontSize: '18px' }} />} disabled={isLoadingSession} />
        </Dropdown>

        {/* Profile/Auth Section - Conditional rendering based on isLoggedIn */}
        {isLoadingSession ? (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Button type="primary" loading size="large" />
          </Space>
        ) : isLoggedIn ? (
          <Dropdown
            menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
            placement="bottomRight"
            trigger={['click']}
            onOpenChange={handleProfileDropdownVisibleChange}
          >
            <a onClick={(e) => e.preventDefault()} className={s['profile-dropdown-trigger']}>
              <Avatar
                icon={<UserOutlined />}
                src={session.user?.image || undefined}
              />
              <span className={s.username}>
                {session.user?.name || session.user?.email || 'Người dùng'}
              </span>
              <Space>
                {isProfileDropdownOpen ? <CaretUpFilled className={s['dropdown-icon']} /> : <CaretDownFilled className={s['dropdown-icon']} />}
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
            <Button type="primary" icon={<UserOutlined />} />
          </Dropdown>
        )}
      </div>
    </header>
  );
}