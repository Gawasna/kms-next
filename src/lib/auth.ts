import { hash, compare } from 'bcryptjs';

const HASH_SALT_ROUNDS = 10; // Số vòng lặp để tạo salt (giá trị càng cao, càng an toàn nhưng chậm hơn)

export async function hashPassword(password: string): Promise<string> {
  return hash(password, HASH_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}