// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Mở rộng interface Request của Express để có thể chứa thông tin user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // Token thường được gửi theo format: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized - Không có token
  }

  try {
    const decoded = verifyToken(token);
    // Gắn thông tin user (ở đây là userId) vào request
    // để các hàm xử lý phía sau có thể sử dụng
    req.user = { id: decoded.userId };
    next(); // Cho phép request đi tiếp
  } catch (error) {
    return res.sendStatus(403); // Forbidden - Token không hợp lệ hoặc đã hết hạn
  }
};