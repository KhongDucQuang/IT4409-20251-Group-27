// src/server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
// Import các router đã tạo
import authRouter from './api/auth';
import boardsRouter from './api/boards';
import listsRouter from './api/lists';
import cardsRouter from './api/cards';
import usersRouter from './api/users';
import { authenticateToken } from './middlewares/auth';
import labelsRouter from './api/labels';
import commentsRouter from './api/comments';
import attachmentsRouter from './api/attachments';
import checklistsRouter from './api/checklists'; // <-- THÊM DÒNG NÀY
import checklistItemsRouter from './api/checklistItems'; // <-- THÊM DÒNG NÀY
import notificationsRouter from './api/notifications';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// === Gắn các router vào ứng dụng ===

// Route không cần xác thực
app.use('/api/auth', authRouter);

// Tất cả các route bên dưới ĐỀU phải đi qua middleware authenticateToken
// Bất kỳ request nào đến /api/boards, /api/lists, /api/cards đều sẽ được bảo vệ
app.use('/api/boards', authenticateToken, boardsRouter);
app.use('/api/lists', authenticateToken, listsRouter);
app.use('/api/cards', authenticateToken, cardsRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/labels', authenticateToken, labelsRouter);
app.use('/api/comments', authenticateToken, commentsRouter);
app.use('/api/attachments', authenticateToken, attachmentsRouter);
app.use('/api/checklists', authenticateToken, checklistsRouter); 
app.use('/api/checklistItems', authenticateToken, checklistItemsRouter); 
app.use('/api/notifications', authenticateToken, notificationsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});