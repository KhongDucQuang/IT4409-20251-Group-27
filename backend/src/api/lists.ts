// src/api/lists.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Middleware kiểm tra quyền sở hữu board cho tất cả các route trong file này
// Đây là một cách tối ưu để không lặp lại code kiểm tra quyền
const checkBoardOwnership = async (req, res, next) => {
  const userId = req.user!.id;
  let boardId;

  // Lấy boardId từ params hoặc body tùy theo request
  if (req.params.boardId) {
    boardId = req.params.boardId;
  } else if (req.body.boardId) {
    boardId = req.body.boardId;
  } else {
    // Nếu không có boardId, ta cần tìm từ listId hoặc cardId
    // Tạm thời bỏ qua các trường hợp phức tạp này, sẽ xử lý ở từng route
    return next();
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.ownerId !== userId) {
    return res.status(403).json({ message: 'Không có quyền truy cập board này' });
  }
  
  next();
};

// POST /api/lists - Tạo một list mới trong một board
// Ta sẽ dùng route dạng /api/boards/:boardId/lists để rõ ràng hơn
// (sẽ cấu hình ở file server.ts)
router.post('/', async (req, res) => {
  const { title, boardId } = req.body;
  const userId = req.user!.id;

  if (!title || !boardId) {
    return res.status(400).json({ message: 'Tiêu đề và boardId là bắt buộc' });
  }

  try {
    // Kiểm tra quyền sở hữu board
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board || board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền tạo list trong board này' });
    }

    // Tính toán position cho list mới
    const maxPosition = await prisma.list.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    const newPosition = (maxPosition._max.position || 0) + 1;

    const newList = await prisma.list.create({
      data: {
        title,
        boardId,
        position: newPosition,
      },
    });
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tạo được list' });
  }
});


// PATCH /api/lists/:listId - Cập nhật list (đổi tên, di chuyển)
router.patch('/:listId', async (req, res) => {
  const { listId } = req.params;
  const { title, position } = req.body;
  const userId = req.user!.id;

  try {
    const list = await prisma.list.findUnique({ where: { id: listId }, include: { board: true } });
    
    // Kiểm tra list có tồn tại và người dùng có phải chủ board không
    if (!list || list.board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền sửa list này' });
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        // Chỉ cập nhật các trường được cung cấp
        ...(title && { title }),
        ...(position && { position }),
      },
    });
    res.json(updatedList);
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy list' });
  }
});


// DELETE /api/lists/:listId - Xóa một list
router.delete('/:listId', async (req, res) => {
  const { listId } = req.params;
  const userId = req.user!.id;

  try {
    const list = await prisma.list.findUnique({ where: { id: listId }, include: { board: true } });

    if (!list || list.board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền xóa list này' });
    }

    await prisma.list.delete({ where: { id: listId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy list' });
  }
});

export default router;