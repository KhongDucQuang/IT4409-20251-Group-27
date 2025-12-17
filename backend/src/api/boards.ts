// src/api/boards.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  checkBoardMembership,
  checkBoardAdmin,
} from '../middlewares/boardAuth';
import { validate } from '../middlewares/validate';
import { createBoardSchema } from '../schemas/board.schema'; // Đảm bảo bạn đã tạo file này

const prisma = new PrismaClient();
const router = Router();

// GET /api/boards - Lấy tất cả các board của người dùng (ĐÃ PHÂN TRANG)
router.get('/', async (req, res) => {
  const userId = req.user!.id;

  try {
    // 1. Lấy page/limit từ query (ví dụ: ?page=1&limit=20)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // 2. Lấy boards và tổng số board (để tính tổng số trang)
    const [boards, totalBoards] = await prisma.$transaction([
      prisma.board.findMany({
        where: { members: { some: { userId: userId } } },
        orderBy: { createdAt: 'desc' },
        skip: skip,  // <-- Bỏ qua
        take: limit, // <-- Lấy
      }),
      prisma.board.count({
        where: { members: { some: { userId: userId } } },
      }),
    ]);

    // 3. Trả về dữ liệu kèm metadata
    res.json({
      data: boards,
      metadata: {
        totalBoards,
        totalPages: Math.ceil(totalBoards / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không lấy được danh sách board' });
  }
});

// POST /api/boards 
router.post('/', validate(createBoardSchema), async (req, res) => {
  const { title } = req.body;
  const userId = req.user!.id;

  try {
    const newBoard = await prisma.board.create({
      data: {
        title,
        members: {
          create: [
            {
              userId: userId,
              role: 'ADMIN',
            },
          ],
        },
      },
    });
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi không tạo được board' });
  }
});

// GET /api/boards/:boardId 
router.get('/:boardId', checkBoardMembership, async (req, res) => {
  const { boardId } = req.params;
  const { labelId, assigneeId } = req.query;

  try {
    const cardFilter: any = {};
    if (labelId) {
      cardFilter.labels = { some: { labelId: labelId as string } };
    }
    if (assigneeId) {
      cardFilter.assignees = { some: { userId: assigneeId as string } };
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        labels: true,
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: cardFilter,
              orderBy: { position: 'asc' },
              include: {
                labels: { include: { label: true } },
                assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
                comments: {
                  include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                  orderBy: { createdAt: 'asc' }
                },
                attachments: true,
                checklists: {
                  orderBy: { position: 'asc' },
                  include: {
                    items: {
                      orderBy: { position: 'asc' }
                    }
                  }
                }
              },
            },
          },
        },
        // **ĐÃ XÓA 'ACTIVITIES' KHỎI ĐÂY**
        // Chúng ta sẽ dùng API phân trang riêng ở dưới
      },
    });

    if (!board) {
      return res.status(404).json({ message: 'Không tìm thấy board' });
    }

    res.json(board);
  } catch (error) {
    console.error(error); // Log lỗi chi tiết
    res.status(500).json({ message: 'Lỗi không tìm thấy board' });
  }
});

// PATCH /api/boards/:boardId - đổi tên, đổi hình nền
router.patch('/:boardId', [checkBoardMembership, checkBoardAdmin], async (req, res) => {
  const { boardId } = req.params;
  const { title, backgroundImageUrl } = req.body;

  // Sửa logic: Cho phép cập nhật chỉ title, chỉ background, hoặc cả hai
  const dataToUpdate: any = {};
  if (title !== undefined) {
    dataToUpdate.title = title;
  }
  if (backgroundImageUrl !== undefined) {
    dataToUpdate.backgroundImageUrl = backgroundImageUrl;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ message: 'Cần cung cấp Tiêu đề (title) hoặc Hình nền (backgroundImageUrl)' });
  }

  try {
    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
      },
      data: dataToUpdate, // Sử dụng data đã lọc
    });
    res.json(updatedBoard);
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy board' });
  }
});

// DELETE /api/boards/:boardId - Xóa board
router.delete('/:boardId', [checkBoardMembership, checkBoardAdmin], async (req, res) => {
  const { boardId } = req.params;

  try {
    await prisma.board.delete({
      where: {
        id: boardId,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: 'Không tìm thấy board' });
  }
});

// Mời user vào board
router.post('/:boardId/members', [checkBoardMembership, checkBoardAdmin], async (req, res) => {
  const { boardId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email là bắt buộc' });
  }

  try {
    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này' });
    }
    
    // Kiểm tra xem user có phải chính mình không
    if (userToInvite.id === req.user!.id) {
        return res.status(400).json({ message: 'Bạn không thể tự mời chính mình' });
    }

    const newMember = await prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id,
        role: 'MEMBER',
      },
    });
    res.status(201).json(newMember);
  } catch (e) {
    // Giả định lỗi do unique constraint
    res.status(409).json({ message: 'Người dùng đã ở trong board' });
  }
});

// === API CHO LABELS ===

// POST /api/boards/:boardId/labels - Tạo label mới cho board
router.post('/:boardId/labels', checkBoardMembership, async (req, res) => {
  const { boardId } = req.params;
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({ message: 'Tên và màu sắc là bắt buộc' });
  }

  try {
    const newLabel = await prisma.label.create({
      data: {
        name,
        color,
        boardId,
      },
    });
    res.status(201).json(newLabel);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo nhãn' });
  }
});

// GET /api/boards/:boardId/labels - Lấy danh sách label của board
router.get('/:boardId/labels', checkBoardMembership, async (req, res) => {
  const { boardId } = req.params;

  try {
    const labels = await prisma.label.findMany({
      where: { boardId },
    });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách nhãn' });
  }
});

// GET /api/boards/:boardId/search - Tìm kiếm card
router.get('/:boardId/search', checkBoardMembership, async (req, res) => {
  const { boardId } = req.params;
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: "Search query 'q' là bắt buộc" });
  }

  try {
    const cards = await prisma.card.findMany({
      where: {
        boardId: boardId,
        OR: [
          { title: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      include: {
        list: { select: { title: true } }
      }
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tìm kiếm' });
  }
});


// GET /api/boards/:boardId/activities - Lấy lịch sử hoạt động (PHÂN TRANG)
router.get('/:boardId/activities', checkBoardMembership, async (req, res) => {
  const { boardId } = req.params;

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [activities, totalActivities] = await prisma.$transaction([
      prisma.activity.findMany({
        where: { boardId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
        skip: skip,
        take: limit,
      }),
      prisma.activity.count({
        where: { boardId },
      }),
    ]);

    res.json({
      data: activities,
      metadata: {
        totalActivities,
        totalPages: Math.ceil(totalActivities / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử hoạt động' });
  }
});


export default router;