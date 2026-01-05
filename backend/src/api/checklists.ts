// src/api/checklists.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Middleware kiểm tra quyền sở hữu checklist
const checkChecklistPermission = async (req, res, next) => {
  const { checklistId } = req.params;
  const userId = req.user!.id;
  
  try {
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      include: { card: true } // Lấy thông tin card cha
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Không tìm thấy checklist' });
    }

    // Kiểm tra user có phải thành viên board chứa checklist này không
    const membership = await prisma.boardMember.findUnique({
      where: { 
        boardId_userId: { boardId: checklist.card.boardId, userId } 
      }
    });
    
    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền' });
    }

    (req as any).checklist = checklist; // Gắn checklist vào req để dùng sau
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PATCH /api/checklists/:checklistId - Sửa checklist (đổi tên)
router.patch('/:checklistId', checkChecklistPermission, async (req, res) => {
  const { checklistId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
  }

  try {
    const updatedChecklist = await prisma.checklist.update({
      where: { id: checklistId },
      data: { title },
    });
    res.json(updatedChecklist);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật checklist' });
  }
});

// DELETE /api/checklists/:checklistId - Xóa checklist
router.delete('/:checklistId', checkChecklistPermission, async (req, res) => {
  try {
    await prisma.checklist.delete({ 
      where: { id: req.params.checklistId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa checklist' });
  }
});

// POST /api/checklists/:checklistId/items - Tạo checklist item mới
router.post('/:checklistId/items', checkChecklistPermission, async (req, res) => {
  const { checklistId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Nội dung là bắt buộc' });
  }

  try {
    const maxPos = await prisma.checklistItem.aggregate({
      where: { checklistId }, _max: { position: true }
    });
    const newPosition = (maxPos._max.position || 0) + 1;

    const newItem = await prisma.checklistItem.create({
      data: {
        content,
        checklistId,
        position: newPosition
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo checklist item' });
  }
});

export default router;