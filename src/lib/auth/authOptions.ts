import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // 1. Kiểm tra đầu vào
                if (!credentials?.email || !credentials.password) {
                    throw new Error('Please enter both email and password.');
                }

                // 2. Tìm người dùng trong database
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                // 3. Kiểm tra xem người dùng có tồn tại và có password hash không (người dùng OAuth sẽ không có)
                if (!user || !user.passwordHash) {
                    throw new Error('Invalid credentials.');
                }

                // 4. So sánh mật khẩu
                const isValid = await verifyPassword(credentials.password, user.passwordHash);

                if (!isValid) {
                    // Mật khẩu không đúng
                    throw new Error('Invalid credentials.');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
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
                console.log('JWT callback triggered for update:', session);
                if (session.name) {
                    token.name = session.name;
                }
                if (session.email) {
                    token.email = session.email;
                }
                if (session.image) {
                    token.picture = session.image;
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
    pages: {
        signIn: '/auth/signin',
        error: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}