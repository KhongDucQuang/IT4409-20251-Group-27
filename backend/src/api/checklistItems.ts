// src/api/checklistItems.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();



// Helper: Middleware kiểm tra quyền sở hữu item
const checkItemPermission = async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user!.id;

  try {
    // 1. Tìm item và checklist/card/board cha của nó
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            card: true
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy checklist item' });
    }

    // 2. Kiểm tra user có phải thành viên board không
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: item.checklist.card.boardId, userId }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};




// PATCH /api/checklistItems/:itemId - Cập nhật item (content, isCompleted, position)
router.patch('/:itemId', checkItemPermission, async (req, res) => {
  const { itemId } = req.params;
  const { content, isCompleted, position } = req.body;

  const dataToUpdate: any = {};
  if (content) dataToUpdate.content = content;
  if (isCompleted !== undefined) dataToUpdate.isCompleted = isCompleted;
  if (position) dataToUpdate.position = position;

  if (Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ message: 'Không có thông tin cập nhật' });
  }



  try {
    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: dataToUpdate
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật checklist item' });
  }
});

// DELETE /api/checklistItems/:itemId - Xóa checklist item
router.delete('/:itemId', checkItemPermission, async (req, res) => {
  try {
    await prisma.checklistItem.delete({
      where: { id: req.params.itemId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa checklist item' });
  }
});

export default router;