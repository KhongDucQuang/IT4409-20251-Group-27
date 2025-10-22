// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import "./config/passport"; // load strategy

import authRouter from "./api/auth";
import boardsRouter from "./api/boards";
import listsRouter from "./api/lists";
import cardsRouter from "./api/cards";
import { authenticateToken } from "./middlewares/auth";

dotenv.config();

const app = express();
app.use(
  session({
    secret: "process.env.SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true nếu dùng HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// === Gắn các router vào ứng dụng ===

// Route không cần xác thực
app.use('/api/auth', authRouter);

// Tất cả các route bên dưới ĐỀU phải đi qua middleware authenticateToken
// Bất kỳ request nào đến /api/boards, /api/lists, /api/cards đều sẽ được bảo vệ
app.use('/api/boards', authenticateToken, boardsRouter);
app.use('/api/lists', authenticateToken, listsRouter);
app.use('/api/cards', authenticateToken, cardsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});