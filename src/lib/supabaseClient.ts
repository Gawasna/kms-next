// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Lấy các biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Kiểm tra xem các biến môi trường đã được cung cấp chưa
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL và Anon Key là bắt buộc.');
}

// -----------------------------------------------------------------------------
// CLIENT-SIDE CLIENT (Sử dụng ở các Client Components)
// -----------------------------------------------------------------------------
// Client này an toàn để sử dụng ở phía trình duyệt.
// Nó sử dụng Anon Key (public) và sẽ tự động xử lý xác thực của người dùng
// khi bạn đăng nhập vào Supabase (nếu bạn dùng Supabase Auth).
// Khi dùng với NextAuth, chúng ta sẽ cần truyền JWT vào để có quyền.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// -----------------------------------------------------------------------------
// SERVER-SIDE CLIENT (Sử dụng ở API Routes, Server Components)
// -----------------------------------------------------------------------------
// Client này sử dụng Service Role Key và có quyền admin.
// KHÔNG BAO GIỜ để lộ client này ra phía trình duyệt.
// Nó có thể bỏ qua mọi chính sách RLS và Storage Policies.
// Rất hữu ích cho các tác vụ backend như cập nhật dữ liệu nội bộ.

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Cảnh báo: SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Client admin sẽ không hoạt động.');
}

export const supabaseAdminClient = supabaseAdmin;

/**
 * Tóm tắt:
 * - `supabase`: Dùng ở Client Components. Sử dụng Anon Key. An toàn để dùng ở trình duyệt.
 * - `supabaseAdminClient`: Dùng ở Server-side (API Routes, Server Components). Sử dụng Service Role Key. Có quyền admin.
 */