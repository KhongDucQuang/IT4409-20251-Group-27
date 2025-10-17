// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Hàm để tạo token
export const generateToken = (userId: string): string => {
  const payload = { userId };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token sẽ hết hạn sau 7 ngày
  });
};

// Hàm để xác thực token
export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};