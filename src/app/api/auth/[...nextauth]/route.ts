// this sh is not dynamic export because NextAuth requires modulize export
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };