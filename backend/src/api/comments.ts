// src/api/comments.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();



// Middleware kiểm tra quyền: Phải là người viết comment HOẶC admin board
const checkCommentPermission = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user!.id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { card: { include: { board: true } } },
    });

    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    // Kiểm tra xem có phải là Admin board không
    const adminMembership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: comment.card.boardId, userId },
      },
    });

    // Nếu không phải là người viết VÀ cũng không phải admin
    if (comment.userId !== userId && adminMembership?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// DELETE /api/comments/:commentId
router.delete('/:commentId', checkCommentPermission, async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa bình luận' });
  }
});

// (Bạn có thể thêm PATCH /api/comments/:commentId để sửa ở đây)

export default router;