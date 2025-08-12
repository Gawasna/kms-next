// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
    // Adapter để NextAuth tương tác với database của bạn thông qua Prisma
    adapter: PrismaAdapter(prisma),

    // Cấu hình các nhà cung cấp xác thực
    providers: [
        CredentialsProvider({
            name: 'Credentials', // Tên hiển thị trên trang đăng nhập mặc định của NextAuth (nếu dùng)
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // 1. Kiểm tra đầu vào
                if (!credentials?.email || !credentials.password) {
                    // Trả về null nếu thông tin không đầy đủ
                    throw new Error('Please enter both email and password.');
                }

                // 2. Tìm người dùng trong database
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                // 3. Kiểm tra xem người dùng có tồn tại và có password hash không (người dùng OAuth sẽ không có)
                if (!user || !user.passwordHash) {
                    // Người dùng không tồn tại hoặc tài khoản không có password hash (ví dụ: đăng ký bằng OAuth)
                    throw new Error('Invalid credentials.');
                }

                // 4. So sánh mật khẩu
                const isValid = await verifyPassword(credentials.password, user.passwordHash);

                if (!isValid) {
                    // Mật khẩu không đúng
                    throw new Error('Invalid credentials.');
                }

                // 5. Nếu xác thực thành công, trả về đối tượng user.
                // Các thuộc tính trong đối tượng này sẽ được sử dụng để tạo session và JWT.
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role, // Đảm bảo bạn trả về role ở đây
                };
            }
        })
    ],

    // Sử dụng chiến lược JWT cho session management (mặc định với App Router)
    session: {
        strategy: 'jwt',
    },

    // Callbacks để tùy chỉnh JWT và Session
    callbacks: {
        async jwt({ token, user, trigger, session  }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }

            // Khi session được cập nhật (trigger là 'update')
            if (trigger === "update" && session) {
                console.log('JWT callback triggered for update:', session); // Dòng này để debug

                // Cập nhật từng trường một cách tường minh
                if (session.name) {
                    token.name = session.name;
                }
                if (session.email) {
                    token.email = session.email;
                }
                if (session.image) {
                    token.picture = session.image; // Ánh xạ session.image vào token.picture
                }
                // Nếu có các trường khác cần cập nhật, thêm vào đây
                // Ví dụ: if (session.role) { token.role = session.role; }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture as string | null;
            }
            return session;
        },
    },

    // Cấu hình trang tùy chỉnh (nếu muốn)
    // Ví dụ: khi người dùng chưa đăng nhập và truy cập trang yêu cầu xác thực,
    // NextAuth sẽ chuyển hướng họ đến '/auth/login'.
    pages: {
        signIn: '/auth/login', // Đường dẫn tới trang đăng nhập của bạn
        error: '/auth/error', // Đường dẫn tới trang lỗi xác thực
    },

    // Secret key được dùng để ký và mã hóa session cookie/JWT.
    // PHẢI được thiết lập trong production và được tạo ngẫu nhiên.
    secret: process.env.NEXTAUTH_SECRET,

    // Bật chế độ debug trong môi trường phát triển để xem log chi tiết hơn.
    debug: process.env.NODE_ENV === 'development',
};

// Xuất các handlers GET và POST để Next.js API Routes nhận diện
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };