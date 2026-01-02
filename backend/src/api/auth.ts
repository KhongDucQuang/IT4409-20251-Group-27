// src/api/auth.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import rateLimit from 'express-rate-limit'; // Đừng quên import rate-limit

const prisma = new PrismaClient();
const router = Router();

// === Cấu hình Rate Limit cho Login ===
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Giới hạn 10 lần thử
  message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});


// api/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

// api/login

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Lỗi 401 (Unauthorized) là lỗi logic, ta chủ động trả về
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  res.status(200).json({ token });
});


export default router;