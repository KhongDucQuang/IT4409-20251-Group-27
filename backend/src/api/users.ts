// src/api/users.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/auth';

const prisma = new PrismaClient();
const router = Router();

// Lấy thông tin profile của chính mình
router.get('/me', async (req, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, bio: true, avatarUrl: true },
  });
  res.json(user);
});

// Cập nhật profile của chính mình
router.patch('/me', async (req, res) => {
  const userId = req.user!.id;
  const { name, bio, avatarUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: { id: true, email: true, name: true, bio: true, avatarUrl: true },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật profile' });
  }
});

export default router;