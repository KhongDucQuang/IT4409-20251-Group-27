// src/utils/notificationHelper.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface NotificationData {
  recipientId: string;
  senderId: string; // Người gửi thông báo (người thực hiện hành động)
  content: string;
  boardId?: string;
  cardId?: string;
}

export const createNotification = async (data: NotificationData) => {
  try {
    await prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        content: data.content,
        boardId: data.boardId,
        cardId: data.cardId,
      },
    });
  } catch (error) {
    console.error('Lỗi không tạo được thông báo:', error);
  }
};