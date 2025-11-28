// src/api/labels.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Middleware helper để kiểm tra quyền sở hữu label
// (thông qua việc kiểm tra thành viên của board chứa label đó)
const checkLabelPermission = async (req, res, next) => {
  const { labelId } = req.params;
  const userId = req.user!.id;

  try {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      return res.status(404).json({ message: 'Không tìm thấy nhãn' });
    }

    // Kiểm tra xem user có phải là thành viên của board chứa label này không
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: label.boardId, userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền thao tác với nhãn này' });
    }

    // Gắn boardId vào request để dùng nếu cần
    (req as any).boardId = label.boardId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// PATCH /api/labels/:labelId - Sửa label
router.patch('/:labelId', checkLabelPermission, async (req, res) => {
  const { labelId } = req.params;
  const { name, color } = req.body;

  try {
    const updatedLabel = await prisma.label.update({
      where: { id: labelId },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    });
    res.json(updatedLabel);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật nhãn' });
  }
});

// DELETE /api/labels/:labelId - Xóa label
router.delete('/:labelId', checkLabelPermission, async (req, res) => {
  const { labelId } = req.params;

  try {
    await prisma.label.delete({
      where: { id: labelId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa nhãn' });
  }
});

export default router;