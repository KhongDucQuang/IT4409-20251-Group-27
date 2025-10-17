// src/api/boards.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/boards - Lấy tất cả các board của người dùng hiện tại
router.get('/', async (req, res) => {
  const userId = req.user!.id; // Lấy userId từ middleware xác thực

  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không lấy được danh sách board' });
  }
});

// POST /api/boards - Tạo một board mới
router.post('/', async (req, res) => {
  const { title } = req.body;
  const userId = req.user!.id;

  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
  }

  try {
    const newBoard = await prisma.board.create({
      data: {
        title,
        ownerId: userId,
      },
    });
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tạo được board' });
  }
});

// GET /api/boards/:boardId - Lấy thông tin chi tiết của một board (bao gồm lists và cards)
router.get('/:boardId', async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    // Quan trọng: Kiểm tra quyền sở hữu
    if (!board || board.ownerId !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập board này' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tìm thấy board' });
  }
});

// PATCH /api/boards/:boardId - Cập nhật (đổi tên) board
router.patch('/:boardId', async (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;
  const userId = req.user!.id;

  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
  }

  try {
    // Prisma cho phép kiểm tra quyền sở hữu ngay trong câu lệnh update
    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
        ownerId: userId, // Chỉ update nếu boardId khớp VÀ ownerId khớp
      },
      data: { title },
    });
    res.json(updatedBoard);
  } catch (error) {
    // Lỗi có thể do không tìm thấy board hoặc không có quyền
    res.status(404).json({ message: 'Không tìm thấy board hoặc bạn không có quyền sửa' });
  }
});

// DELETE /api/boards/:boardId - Xóa board
router.delete('/:boardId', async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  try {
    await prisma.board.delete({
      where: {
        id: boardId,
        ownerId: userId, // Chỉ xóa nếu là chủ sở hữu
      },
    });
    res.status(204).send(); // 204 No Content là mã thành công cho việc xóa
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy board hoặc bạn không có quyền xóa' });
  }
});

export default router;