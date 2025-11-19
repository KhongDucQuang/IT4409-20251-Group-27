// src/api/notifications.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/notifications - Lấy tất cả thông báo của user (ĐÃ PHÂN TRANG)
router.get('/', async (req, res) => {
  const userId = req.user!.id;

  try { // <-- THÊM TRY...CATCH
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [notifications, totalNotifications] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
          board: { select: { id: true, title: true } },
          card: { select: { id: true, title: true } },
        },
        skip: skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { recipientId: userId },
      }),
    ]);

    res.json({
      data: notifications,
      metadata: {
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) { // <-- THÊM TRY...CATCH
    res.status(500).json({ message: 'Lỗi lấy thông báo' });
  }
});

// PATCH /api/notifications/:notificationId/read - Đánh dấu đã đọc một thông báo
router.patch('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user!.id;

  try { // <-- THÊM TRY...CATCH
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.recipientId !== userId) {
      return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    res.json(updatedNotification);
  } catch (error) { // <-- THÊM TRY...CATCH
    res.status(500).json({ message: 'Lỗi đánh dấu đã đọc' });
  }
});

// PATCH /api/notifications/read-all - Đánh dấu tất cả thông báo là đã đọc
router.patch('/read-all', async (req, res) => {
  const userId = req.user!.id;

  try { // <-- THÊM TRY...CATCH
    await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) { // <-- THÊM TRY...CATCH
    res.status(500).json({ message: 'Lỗi đánh dấu tất cả đã đọc' });
  }
});

export default router;