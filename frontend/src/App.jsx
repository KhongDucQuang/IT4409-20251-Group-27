import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from '~/pages/Auth'
import BoardList from '~/pages/Boards'
import BoardDetail from '~/pages/Boards/_id'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace={true} />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/boards" element={<BoardList />} />
      <Route path="/boards/:boardId" element={<BoardDetail />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App