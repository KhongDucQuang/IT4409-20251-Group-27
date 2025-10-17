// src/server.ts
import express from 'express';
import cors from 'cors';

// Import các router đã tạo
import authRouter from './api/auth';
import boardsRouter from './api/boards';
import listsRouter from './api/lists';
import cardsRouter from './api/cards';

import { authenticateToken } from './middlewares/auth';

const app = express();
app.use(cors());
app.use(express.json());

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