// src/utils/activityLogger.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface LogData {
  userId: string;
  boardId: string;
  cardId?: string;
  content: string; // Nội dung đã được tạo sẵn
}

export const createActivityLog = async (data: LogData) => {
  try {
    await prisma.activity.create({
      data: {
        userId: data.userId,
        boardId: data.boardId,
        cardId: data.cardId,
        content: data.content,
      },
    });
  } catch (error) {
    console.error('Lỗi không ghi được log hoạt động:', error);
  }
};