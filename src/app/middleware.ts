// src/middleware.ts
// (hoặc middleware.ts nếu đặt ở thư mục gốc)
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client"; // Import UserRole của bạn

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    //CM#01: Rút gọn các parameter này
    const path = request.nextUrl.pathname;
    const token = request.nextauth.token;
    //CM#02: Rút gọn các Next Response.json() thành một hàm tiện ích
    function forbidden(message: string) {
      return NextResponse.json({ message }, { status: 403 });
    }
    
    //--- BLOCK BẢO VỆ APIs ---//
    //--- BẢO VỆ API QUẢN LÝ NGƯỜI DÙNG ---//
    if (
      path.startsWith("/api/users") && token?.role !== UserRole.ADMIN
    ) {
      return forbidden("Bạn không có quyền truy cập API này.");
    }


    // Ví dụ: Bảo vệ route admin
    // Nếu path là /dashboard/admin
    // Và người dùng không phải là ADMIN
    // Thì trả về lỗi 403 (Forbidden) hoặc chuyển hướng
    // CM: Áp dụng CM#01
    if (
      path.startsWith("/dashboard/admin") &&
      token?.role !== UserRole.ADMIN
    ) {
      // Bạn có thể chuyển hướng về trang lỗi 403 hoặc trang chủ
      // return NextResponse.rewrite(new URL("/auth/access-denied", request.url));
      return NextResponse.json(
        { message: "Bạn không có quyền truy cập trang này." },
        { status: 403 }
      );
    }

    // Ví dụ: Bảo vệ route dashboard/lecturer
    if (
        request.nextUrl.pathname.startsWith("/dashboard/lecturer") &&
        request.nextauth.token?.role !== UserRole.LECTURER &&
        request.nextauth.token?.role !== UserRole.ADMIN // Admin cũng có thể truy cập
    ) {
        return NextResponse.json(
            { message: "Bạn không có quyền truy cập trang này." },
            { status: 403 }
        );
    }

    // Nếu mọi thứ đều ổn, cho phép request tiếp tục
    return NextResponse.next();
  },
  {
    // Cấu hình `callbacks` để xác định khi nào người dùng được phép truy cập
    // Các route được chỉ định trong `matcher` sẽ được kiểm tra ở đây
    callbacks: {
      authorized: ({ token, req }) => {
        // `token` là JWT của người dùng (nếu có)
        // `req` là đối tượng request

        // Điều kiện chung: nếu có token, tức là đã đăng nhập
        // Mặc định, nếu có token, NextAuth.js sẽ cho phép
        // Để bảo vệ các trang, bạn cần kiểm tra token
        const path = req.nextUrl.pathname;

        // 1. Các trang công khai (cho phép tất cả, kể cả chưa đăng nhập)
        if (
          path.startsWith("/auth/login") ||
          path.startsWith("/auth/register") ||
          path.startsWith("/auth/error") ||
          path === "/" // Trang chủ công khai
        ) {
          return true;
        }

        // 2. Các trang cần xác thực (yêu cầu token)
        // Bất kỳ route nào bắt đầu bằng /dashboard (trừ admin/lecturer đã xử lý ở trên)
        // hoặc /profile, /settings, v.v.
        if (path.startsWith("/dashboard") || path.startsWith("/profile")) {
          return !!token; // Chỉ cho phép nếu có token (đã đăng nhập)
        }

        // 3. Các route API không liên quan đến NextAuth hoặc riêng tư
        if (path.startsWith("/api/heartbeat")) {
          return true; // Cho phép heartbeat từ cả người dùng và khách
        }
        if (path.startsWith("/api/register")) {
          return true; // Cho phép API đăng ký
        }
        // Các API khác yêu cầu xác thực có thể được kiểm tra riêng

        // Mặc định: nếu không khớp với bất kỳ quy tắc nào, cho phép
        // (Bạn có thể thay đổi để mặc định là false nếu muốn bảo vệ nghiêm ngặt)
        return true;
      },
    },
    // Trang mà người dùng chưa xác thực sẽ được chuyển hướng đến
    pages: {
        signIn: '/auth/login', // Đây là trang đăng nhập bạn đã cấu hình
    }
  }
);

// Định nghĩa `matcher` để chỉ định các route mà middleware sẽ chạy trên đó
// Đây là CỰC KỲ QUAN TRỌNG. Middleware chỉ chạy trên các path khớp với matcher.
export const config = {
  matcher: [
    /*
     * Match tất cả các path trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - và các file trong thư mục `public` (css, js, images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Hoặc cụ thể hơn, chỉ các route cần bảo vệ:
    // "/dashboard/:path*",
    // "/profile/:path*",
    // "/api/protected/:path*",
    // "/api/heartbeat" // Thêm heartbeat vào để nó có thể truy cập session.token
  ],
};