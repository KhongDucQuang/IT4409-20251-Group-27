// src/middlewares/boardAuth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

// Hàm này sẽ kiểm tra xem user có phải là thành viên của board không
export const checkBoardMembership = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  // Lấy boardId từ params, hoặc từ body (tùy API)
  const boardId = req.params.boardId || req.body.boardId;

  if (!boardId) {
    // Nếu API không liên quan đến boardId, ví dụ như /api/lists/:listId
    // chúng ta cần tìm boardId từ listId. Tạm thời bỏ qua, sẽ xử lý sau.
    // Tốt nhất là các API nên có boardId
    return res.status(400).json({ message: 'Missing boardId' });
  }

  try {
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của board này' });
    }

    // Gắn vai trò vào request để dùng sau
    (req as any).role = membership.role;
    next();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy board' });
  }
};

// Hàm này kiểm tra user có phải là ADMIN của board không
export const checkBoardAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).role !== 'ADMIN') {
    return res.status(403).json({ message: 'Bạn phải là ADMIN để thực hiện hành động này' });
  }
  next();
};