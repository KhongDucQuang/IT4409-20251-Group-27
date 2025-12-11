import { Routes, Route, Navigate } from 'react-router-dom';
import Board from './pages/Boards/_id';
import Boards from './pages/Boards/index';
import Login from './pages/Auth/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from './pages/Auth/Register';
// 1. 👇 Import ConfirmProvider
import { ConfirmProvider } from 'material-ui-confirm';

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />
      {/* 2. 👇 Bọc ConfirmProvider quanh Routes */}
      <ConfirmProvider
        defaultOptions={{
          allowClose: false,
          dialogProps: { maxWidth: 'xs' }, // Popup nhỏ gọn
          buttonOrder: ['confirm', 'cancel'], // Nút xác nhận bên trái
          cancellationButtonProps: { color: 'inherit' },
          confirmationButtonProps: { color: 'secondary', variant: 'outlined' }
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/boards/:boardId" element={<Board />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </ConfirmProvider>

      <ToastContainer position="bottom-right" theme="colored" />
    </>
  );
}

export default App