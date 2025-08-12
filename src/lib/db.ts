import { PrismaClient } from '@prisma/client';

// Đảm bảo rằng biến toàn cục 'prisma' chỉ được định nghĩa một lần
// Đây là một mẫu thiết kế cho hot-reloading trong phát triển Next.js
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;