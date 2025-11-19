// src/api/cards.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { upload } from '../utils/fileUpload';
import { createActivityLog } from '../utils/activityLogger';
import { createNotification } from '../utils/notificationHelper';

const prisma = new PrismaClient();
const router = Router();


const checkCardPermission = async (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user!.id;

  try {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });
    if (!card) {
      return res.status(404).json({ message: 'Không tìm thấy thẻ' });
    }

    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: card.boardId, userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không có quyền thao tác với thẻ này' });
    }
    
    // Gắn boardId của card vào request để dùng
    (req as any).boardId = card.boardId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// POST /api/cards - Tạo một card mới
router.post('/', async (req, res) => {
  const { title, listId } = req.body;
  const userId = req.user!.id;

  if (!title || !listId) {
    return res.status(400).json({ message: 'Tiêu đề và listId là bắt buộc' });
  }

  try {
    // THAY ĐỔI: Logic kiểm tra quyền
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
      return res.status(403).json({ message: 'Không có quyền tạo card trong list này' });
    }

    // 3. Nếu có quyền, tiến hành tạo card
    const maxPosition = await prisma.card.aggregate({
      where: { listId },
      _max: { position: true },
    });
    const newPosition = (maxPosition._max.position || 0) + 1;

    const newCard = await prisma.card.create({
      data: {
        title,
        listId,
        boardId: list.boardId,
        position: newPosition,
      },
    });

    // LOG HOẠT ĐỘNG
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { name: true }
    });
    await createActivityLog({
      userId: userId,
      boardId: list.boardId,
      cardId: newCard.id,
      content: `${user?.name || 'Một ai đó'} đã tạo thẻ '${newCard.title}' trong danh sách '${list.title}'`
    });

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tạo được card' });
  }
});

// PATCH /api/cards/:cardId - Cập nhật card
router.patch('/:cardId', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  const { title, description, dueDate, position, listId } = req.body;
  // const userId = req.user!.id; // Không cần nữa

  try {
    // THAY ĐỔI: Xóa toàn bộ logic kiểm tra quyền ở đây
    // (tìm card, check membership...)
    
    // Chỉ cần tiến hành cập nhật
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
router.delete('/:cardId', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  // const userId = req.user!.id; // Không cần nữa

  try {
    // THAY ĐỔI: Xóa toàn bộ logic kiểm tra quyền ở đây

    // Chỉ cần tiến hành xóa
    await prisma.card.delete({ where: { id: cardId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy card' });
  }
});

// POST /api/cards/:cardId/assignees - Gán user cho card
router.post('/:cardId/assignees', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  const { userId: userToAssignId } = req.body;
  const boardId = (req as any).boardId; // Lấy từ middleware
  const senderId = req.user!.id;

  if (!userToAssignId) {
    return res.status(400).json({ message: 'userId là bắt buộc' });
  }

  try {
    // 1. Kiểm tra xem người được gán có phải là thành viên board không
    const memberToAssign = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: userToAssignId } },
    });
    if (!memberToAssign) {
      return res.status(403).json({ message: 'Người dùng này không phải là thành viên của board' });
    }

    // 2. Gán user vào card
    await prisma.assigneesOnCards.create({
      data: {
        cardId,
        userId: userToAssignId,
      },
    });

    // Chỉ gửi thông báo nếu người gán không phải là người được gán
    if (senderId !== userToAssignId) {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      });
      const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: { title: true }
      });

      if (sender && card) {
        await createNotification({
          recipientId: userToAssignId, // Người nhận là người được gán
          senderId: senderId,
          content: `${sender.name} đã gán bạn vào thẻ '${card.title}'`,
          boardId: boardId,
          cardId: cardId,
        });
      }
    }

    res.status(201).json({ message: 'Gán thành công' });
  } catch (e) {
    // Bắt lỗi nếu gán trùng
    res.status(409).json({ message: 'Người dùng đã được gán' });
  }
});

// DELETE /api/cards/:cardId/assignees/:userId - Hủy gán user
router.delete('/:cardId/assignees/:userId', checkCardPermission, async (req, res) => {
  const { cardId, userId: userToUnassignId } = req.params;
  const boardId = (req as any).boardId;
  const senderId = req.user!.id;

  try {
    await prisma.assigneesOnCards.delete({
      where: {
        cardId_userId: { cardId, userId: userToUnassignId },
      },
    });

    // Chỉ gửi thông báo nếu người hủy gán không phải là người bị hủy gán
    if (senderId !== userToUnassignId) {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
      });
      const card = await prisma.card.findUnique({
        where: { id: cardId },
        select: { title: true }
      });

      if (sender && card) {
        await createNotification({
          recipientId: userToUnassignId, // Người nhận là người bị hủy gán
          senderId: senderId,
          content: `${sender.name} đã hủy gán bạn khỏi thẻ '${card.title}'`,
          boardId: boardId,
          cardId: cardId,
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy' });
  }
});

// POST /api/cards/:cardId/labels - Gán label cho card
router.post('/:cardId/labels', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  const { labelId } = req.body;
  const boardId = (req as any).boardId; // Lấy từ middleware

  if (!labelId) {
    return res.status(400).json({ message: 'labelId là bắt buộc' });
  }

  try {
    // 1. Kiểm tra xem label có thuộc board này không
    const label = await prisma.label.findUnique({ where: { id: labelId } });
    if (!label || label.boardId !== boardId) {
      return res.status(403).json({ message: 'Label không thuộc board này' });
    }
    
    // 2. Gán label vào card
    await prisma.labelsOnCards.create({
      data: {
        cardId,
        labelId,
      },
    });
    res.status(201).json({ message: 'Gán nhãn thành công' });
  } catch (e) {
    res.status(409).json({ message: 'Nhãn đã được gán' });
  }
});

// DELETE /api/cards/:cardId/labels/:labelId - Hủy gán label
router.delete('/:cardId/labels/:labelId', checkCardPermission, async (req, res) => {
  const { cardId, labelId } = req.params;

  try {
    await prisma.labelsOnCards.delete({
      where: {
        cardId_labelId: { cardId, labelId },
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy' });
  }
});

// src/api/cards.ts
// ...
// router.delete('/:cardId/labels/:labelId', ...)

// === API CHO COMMENT ===

// POST /api/cards/:cardId/comments - Tạo bình luận mới
router.post('/:cardId/comments', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content) {
    return res.status(400).json({ message: 'Nội dung là bắt buộc' });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        cardId,
        userId,
      },
      include: { user: { select: { name: true, avatarUrl: true } } } // Trả về thông tin user
    });

    const card = await prisma.card.findUnique({ 
      where: { id: cardId }, 
      select: { title: true, boardId: true }
    });
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { name: true }
    });

    if (card) { // Chỉ log nếu tìm thấy card
      await createActivityLog({
        userId: userId,
        boardId: card.boardId,
        cardId: cardId,
        content: `${user?.name || 'Một ai đó'} đã bình luận trong thẻ '${card.title}'`
      });

      const mentionedUsernames = content.match(/@(\w+)/g); // Tìm tất cả @username trong content
      
      if (mentionedUsernames && mentionedUsernames.length > 0) {
        const uniqueUsernames = [...new Set(mentionedUsernames.map(m => m.substring(1)))]; // Lấy unique username
        
        const mentionedUsers = await prisma.user.findMany({
          where: {
            name: {
              in: uniqueUsernames,
              mode: 'insensitive' // Tìm kiếm không phân biệt chữ hoa/thường
            }
          },
          select: { id: true, name: true }
        });

        for (const mentionedUser of mentionedUsers) {
          // Tránh gửi thông báo cho chính người đã comment
          if (mentionedUser.id === userId) continue; 

          await createNotification({
            recipientId: mentionedUser.id, // Người nhận thông báo
            senderId: userId,             // Người gửi thông báo (người comment)
            content: `${senderUser.name} đã nhắc đến bạn trong thẻ '${card.title}'`,
            boardId: card.boardId,
            cardId: cardId,
          });
        }
      }

    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo bình luận' });
  }
});

// POST /api/cards/:cardId/attachments - Upload file đính kèm
router.post(
  '/:cardId/attachments',
  checkCardPermission,
  upload.single('file'), // <-- Middleware của Multer
  async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }

    const { filename, mimetype, originalname } = req.file;
    // Đường dẫn URL để truy cập file (vì đã cấu hình static 'uploads')
    const fileUrl = `uploads/${filename}`; 

    try {
      const newAttachment = await prisma.attachment.create({
        data: {
          fileName: originalname,
          url: fileUrl,
          mimeType: mimetype,
          cardId,
          userId,
        },
      });
      res.status(201).json(newAttachment);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi lưu thông tin file' });
    }
  }
);

// POST /api/cards/:cardId/checklists - Tạo checklist mới
router.post('/:cardId/checklists', checkCardPermission, async (req, res) => {
  const { cardId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });
  }

  try {
    const maxPos = await prisma.checklist.aggregate({
      where: { cardId }, _max: { position: true }
    });
    const newPosition = (maxPos._max.position || 0) + 1;

    const newChecklist = await prisma.checklist.create({
      data: {
        title,
        cardId,
        position: newPosition
      }
    });
    res.status(201).json(newChecklist);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo checklist' });
  }
});

export default router;