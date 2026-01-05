// src/api/lists.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
// THAY ĐỔI: Import middleware mới
import { checkBoardMembership } from '../middlewares/boardAuth';

const prisma = new PrismaClient();
const router = Router();

// POST /api/lists
router.post('/', checkBoardMembership, async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || !boardId) {
    return res.status(400).json({ message: 'Tiêu đề và boardId là bắt buộc' });
  }

  try {
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

// PATCH /api/lists/:listId - Cập nhật list theo id
router.patch('/:listId', async (req, res) => {
  const { listId } = req.params;
  const { title, position } = req.body;
  const userId = req.user!.id;

  try {
    // 1. Tìm list để lấy boardId
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      return res.status(404).json({ message: 'Không tìm thấy list' });
    }

    // 2. Kiểm tra xem user có phải là thành viên của board chứa list này không
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: list.boardId, userId: userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa list này' });
    }

    // 3. Nếu có quyền, tiến hành cập nhật
    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(title && { title }),
        ...(position && { position }),
      },
    });
    res.json(updatedList);
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy list' });
  }
});

// DELETE /api/lists/:listId - Xóa list theo id
router.delete('/:listId', async (req, res) => {
  const { listId } = req.params;
  const userId = req.user!.id;

  try {
    // 1. Tìm list để lấy boardId
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      return res.status(404).json({ message: 'Không tìm thấy list' });
    }

    // 2. Kiểm tra xem user có phải là thành viên của board chứa list này không
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: list.boardId, userId: userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa list này' });
    }

    // 3. Nếu có quyền, tiến hành xóa
    await prisma.list.delete({ where: { id: listId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy list' });
  }
});

export default router;