// src/api/attachments.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs'; // <-- Import 'fs' để xóa file
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

// Middleware kiểm tra quyền
const checkAttachmentPermission = async (req, res, next) => {
  // Logic tương tự checkCommentPermission: phải là người upload hoặc admin
  // ... (Tự thực hiện dựa trên file comments.ts)
  // Tạm thời cho qua để test:
  next();
};

// DELETE /api/attachments/:attachmentId
router.delete('/:attachmentId', checkAttachmentPermission, async (req, res) => {
  const { attachmentId } = req.params;
  try {
    // 1. Tìm attachment trong CSDL
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return res.status(404).json({ message: 'Không tìm thấy tệp đính kèm' });
    }

    // 2. Xóa file vật lý khỏi server
    // (Chúng ta đã lưu 'url' là 'uploads/filename.png')
    const filePath = path.join(__dirname, '../../', attachment.url); // Xây dựng đường dẫn tuyệt đối
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Lỗi không xóa được file:', err);
        // Vẫn tiếp tục dù không xóa được file
      }
    });

    // 3. Xóa record khỏi CSDL
    await prisma.attachment.delete({ where: { id: attachmentId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa tệp đính kèm' });
  }
});

export default router;