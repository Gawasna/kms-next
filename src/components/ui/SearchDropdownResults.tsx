// src/components/ui/SearchDropdownResults.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Space, Typography, Divider } from 'antd';

import { SearchResult } from '../../types/search'; // Đảm bảo đường dẫn này đúng

import styles from './styles/SearchDropdownResults.module.css'; // Đảm bảo đường dẫn này đúng

interface SearchDropdownResultsProps {
  results: SearchResult[];
  searchTerm: string;
  onResultClick?: (result: SearchResult) => void;
}

const { Text } = Typography;

export default function SearchDropdownResults({ results, searchTerm, onResultClick }: SearchDropdownResultsProps) {
  const displayResults = results.slice(0, 7);

  return (
    <div className={styles.searchDropdownContainer}>
      {displayResults.length > 0 ? (
        <ul className={styles.resultsList}>
          {displayResults.map((result) => (
            <li
              key={result.id}
              className={styles.resultItem}
              onClick={() => onResultClick && onResultClick(result)}
            >
              <Link href={`/documents/${result.id}`} className={styles.resultLink}>
                <Space align="start" className={styles.resultItemSpace}>
                  <div className={styles.thumbnailWrapper}>
                    <Image
                      src={result.thumbnail}
                      alt={result.title}
                      width={40}
                      height={40}
                      className={styles.thumbnail}
                      unoptimized={true} // Vẫn để unoptimized nếu dùng placeholder URL tĩnh
                    />
                  </div>
                  <div className={styles.info}>
                    <Text strong className={styles.title}>{result.title}</Text>
                    <Text italic className={styles.authorDate}>
                      {result.author} - {result.date}
                    </Text>
                  </div>
                </Space>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noResults}>
          <Text type="secondary">Không tìm thấy kết quả nào phù hợp.</Text>
        </div>
      )}

      <Divider className={styles.divider} />

      <div className={styles.footer}>
        <Link href={`/search/advanced?q=${encodeURIComponent(searchTerm)}`} className={styles.advancedSearchLink}>
          Tìm Kiếm Nâng Cao
        </Link>
      </div>
    </div>
  );
}