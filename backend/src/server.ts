import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http'; // 1. Import HTTP
import { Server } from 'socket.io';  // 2. Import Socket.IO

// Import các router đã tạo
import authRouter from './api/auth';
import boardsRouter from './api/boards';
import listsRouter from './api/lists';
import cardsRouter from './api/cards';
import usersRouter from './api/users';
import labelsRouter from './api/labels';
import commentsRouter from './api/comments';
import attachmentsRouter from './api/attachments';
import checklistsRouter from './api/checklists';
import checklistItemsRouter from './api/checklistItems';
import notificationsRouter from './api/notifications';

import { authenticateToken } from './middlewares/auth';

const app = express();

// 3. Tạo HTTP Server từ Express App
const httpServer = createServer(app);

// 4. Cấu hình Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware CORS cho Express
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === XỬ LÝ SOCKET.IO ===
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. Join vào Board (Room) - Khi người dùng xem một board cụ thể
  socket.on('join_board', (boardId) => {
    // 👇 BẪY SỐ 2: Kiểm tra xem User có vào đúng phòng không
    socket.join(boardId);
    console.log(`✅ [SERVER] User ${socket.id} đã Join Room: ${boardId}`);
  });

  // 2. Join User Room - Để nhận thông báo cá nhân
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined user room: ${userId}`);
  });

  // 3. Xử lý sự kiện Update Board (Kéo thả, sửa tên, comment...)
  socket.on('FE_UPDATE_BOARD', (data) => {
    const { boardId } = data;
    
    // 👇 BẪY SỐ 1: Kiểm tra xem Server có nhận được tin không
    console.log(`🔥 [SERVER] Nhận FE_UPDATE_BOARD từ ${socket.id} -> Room: ${boardId}`);
    
    // Báo cho tất cả người khác
    socket.to(boardId).emit('BE_RELOAD_BOARD', data);
  });

  // 4. Xử lý sự kiện Kéo thả (Chi tiết - Tùy chọn nếu dùng FE_UPDATE_BOARD thì cái này để bổ trợ)
  socket.on('FE_MOVE_LIST', (data) => {
    const { boardId } = data;
    socket.to(boardId).emit('BE_UPDATE_LIST_ORDER', data);
  });

  socket.on('FE_MOVE_CARD', (data) => {
    const { boardId } = data;
    socket.to(boardId).emit('BE_UPDATE_CARD_ORDER', data);
  });

  // 5. Xử lý sự kiện Thông báo
  socket.on('FE_SEND_NOTIFICATION', (data) => {
    const { recipientId } = data;
    // Gửi riêng cho người nhận
    socket.to(recipientId).emit('BE_NEW_NOTIFICATION', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Gán io vào app để có thể dùng ở file khác nếu cần (req.app.get('socketio'))
app.set('socketio', io);

// === Gắn các router vào ứng dụng ===

// Route không cần xác thực
app.use('/api/auth', authRouter);

// Tất cả các route bên dưới ĐỀU phải đi qua middleware authenticateToken
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

// 5. Thay app.listen bằng httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});