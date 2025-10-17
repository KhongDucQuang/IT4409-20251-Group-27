// src/api/cards.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// POST /api/cards - Tạo một card mới
router.post('/', async (req, res) => {
  const { title, listId } = req.body;
  const userId = req.user!.id;

  if (!title || !listId) {
    return res.status(400).json({ message: 'Tiêu đề và listId là bắt buộc' });
  }
  
  try {
    const list = await prisma.list.findUnique({ where: { id: listId }, include: { board: true }});
    if (!list || list.board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền tạo card trong list này' });
    }

    const maxPosition = await prisma.card.aggregate({
      where: { listId },
      _max: { position: true },
    });
    const newPosition = (maxPosition._max.position || 0) + 1;

    const newCard = await prisma.card.create({
      data: {
        title,
        listId,
        boardId: list.boardId, // Lấy boardId từ list cha
        position: newPosition,
      },
    });
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tạo được card' });
  }
});

// PATCH /api/cards/:cardId - Cập nhật card
router.patch('/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const { title, description, dueDate, position, listId } = req.body;
  const userId = req.user!.id;

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true }});
    if (!card || card.board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền sửa card này' });
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        title,
        description,
        dueDate,
        position,
        listId,
      },
    });
    res.json(updatedCard);
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy card' });
  }
});

// DELETE /api/cards/:cardId - Xóa card
router.delete('/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user!.id;

  try {
    const card = await prisma.card.findUnique({ where: { id: cardId }, include: { board: true } });
    if (!card || card.board.ownerId !== userId) {
      return res.status(403).json({ message: 'Không có quyền xóa card này' });
    }
    
    await prisma.card.delete({ where: { id: cardId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy card' });
  }
});

export default router;