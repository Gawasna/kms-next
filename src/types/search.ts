// src/types/search.ts

export interface SearchResult {
  id: number;
  title: string;
  author: string;
  date: string; // Có thể dùng Date hoặc string định dạng ngày tháng tùy theo cách bạn xử lý
  thumbnail: string; // URL của ảnh thumbnail
}