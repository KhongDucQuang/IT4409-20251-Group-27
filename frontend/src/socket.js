import { io } from 'socket.io-client';
import { API_ROOT } from '~/utils/constants';

// Kết nối tới Backend (API_ROOT thường là http://localhost:3000)
// Nếu chưa có API_ROOT thì bạn thay bằng chuỗi 'http://localhost:3000'
export const socket = io(API_ROOT);