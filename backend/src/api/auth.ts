// src/api/auth.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import passport from "passport";
import { Request, Response, NextFunction } from "express";


const prisma = new PrismaClient();
const router = Router();

// === Endpoint Đăng ký (Register) ===
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Validate input (đơn giản)
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // 3. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); // 10 là salt rounds

    // 4. Lưu người dùng mới vào database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // 5. Tạo JWT token
    const token = generateToken(user.id);

    // 6. Trả về thông tin người dùng (loại bỏ mật khẩu) và token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// === Endpoint Đăng nhập (Login) ===
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 2. Tìm người dùng bằng email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Chú ý: Không nên báo "User not found" để tránh lộ thông tin
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Nếu khớp, tạo JWT token
    const token = generateToken(user.id);

    // 5. Trả về token
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

// login bằng Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback sau khi Google xác thực
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  asyncHandler(async (req: any, res: Response) => {
    const { id, displayName, emails, photos } = req.user;

    let user = await prisma.user.findUnique({ where: { googleId: id } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: id,
          name: displayName || "No name",
          email: emails && emails[0] ? emails[0].value : `${id}@google.temp`, // fallback
        },
      });
    }

    const token = generateToken(user.id);
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  })
);


export default router;