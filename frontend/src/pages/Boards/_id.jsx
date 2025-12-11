// src/pages/Boards/_id.jsx
import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'

// 1. Import useParams để lấy ID từ URL
import { useParams } from 'react-router-dom'

// Import các API
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, deleteColumnAPI } from '~/apis/boardApi'
import { toast } from 'react-toastify'

// Import Modal
import ActiveCardModal from '~/components/Modal/ActiveCardModal/ActiveCardModal'

// 👇 IMPORT SOCKET
import { socket } from '~/socket'

function Board() {
  const [board, setBoard] = useState(null)

  // 2. State quản lý Modal Active Card
  const [activeCard, setActiveCard] = useState(null)
  const [isShowModalActiveCard, setIsShowModalActiveCard] = useState(false)

  // 3. State quản lý Tìm kiếm (Search)
  const [searchValue, setSearchValue] = useState('')

  // Lấy boardId từ URL (do router định nghĩa /boards/:boardId)
  const { boardId } = useParams()

  useEffect(() => {
    // Tách hàm gọi API ra để tái sử dụng
    const fetchBoardData = () => {
      fetchBoardDetailsAPI(boardId).then(boardData => {
        // Sắp xếp thứ tự các cột
        boardData.columns = mapOrder(boardData.columns, boardData.columnOrderIds, '_id')
        setBoard(boardData)
      })
    }

    // 1. Gọi API lấy dữ liệu lần đầu khi vào trang
    fetchBoardData()

    // 2. Cấu hình Real-time (Socket.IO)
    console.log('👋 [CLIENT B] Xin join room:', boardId)
    socket.emit('join_board', boardId)

    // 👇 Hàm xử lý reload có độ trễ 200ms để tránh Race Condition (Database chưa lưu kịp)
    const onReloadBoard = (data) => {
      console.log('🔔 [CLIENT B] Đã nhận được lệnh RELOAD!', data)
      setTimeout(() => {
        fetchBoardData()
      }, 200)
    }

    // Lắng nghe các sự kiện update từ Server
    // 👇 SỬA Ở ĐÂY: Dùng hàm onReloadBoard thay vì fetchBoardData trực tiếp
    socket.on('BE_UPDATE_LIST_ORDER', onReloadBoard)
    socket.on('BE_UPDATE_CARD_ORDER', onReloadBoard)
    socket.on('BE_RELOAD_BOARD', onReloadBoard)

    // Cleanup function: Gỡ sự kiện khi component unmount
    return () => {
      socket.off('BE_UPDATE_LIST_ORDER', onReloadBoard)
      socket.off('BE_UPDATE_CARD_ORDER', onReloadBoard)
      socket.off('BE_RELOAD_BOARD', onReloadBoard)
    }

  }, [boardId])

  // 👇 THÊM ĐOẠN NÀY: Tự động cập nhật Modal khi Board thay đổi (Fix lỗi User B đang mở modal mà không thấy update)
  useEffect(() => {
    if (activeCard && board) {
      // Tìm thẻ đang mở trong dữ liệu board mới nhất
      let newActiveCard = null
      for (let column of board.columns) {
        const foundCard = column.cards?.find(c => c._id === activeCard._id)
        if (foundCard) {
          newActiveCard = foundCard
          break
        }
      }
      // Nếu tìm thấy -> Cập nhật state activeCard
      if (newActiveCard) {
        setActiveCard(newActiveCard)
      }
    }
  }, [board])

  // --- CÁC HÀM XỬ LÝ MODAL ---
  const handleSetActiveCard = (card) => {
    setActiveCard(card)
    setIsShowModalActiveCard(true)
  }

  const handleCloseModal = () => {
    setIsShowModalActiveCard(false)
    setActiveCard(null)
  }

  // --- CÁC HÀM XỬ LÝ DỮ LIỆU (CRUD) ---

  // 1. Tạo Column mới
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
    socket.emit('FE_UPDATE_BOARD', { boardId: board._id })
  }

  // 2. Tạo Card mới
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      title: newCardData.title,
      listId: newCardData.columnId
    })

    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(c => c._id === createdCard.columnId)

    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    setBoard(newBoard)
    socket.emit('FE_UPDATE_BOARD', { boardId: board._id })
  }

  // 3. Xóa Column
  const handleDeleteColumn = async (columnId) => {
    // Cập nhật UI ngay lập tức (Optimistic UI)
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)

    // Gọi API
    try {
      await deleteColumnAPI(columnId)
      toast.success('Đã xóa cột thành công')
      socket.emit('FE_UPDATE_BOARD', { boardId: board._id })
    } catch (error) {
      toast.error('Lỗi xóa cột')
    }
  }

  if (!board) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Board...
      </div>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Truyền props tìm kiếm xuống AppBar */}
      <AppBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />

      <BoardBar board={board} />

      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}

        // Truyền hàm mở modal & xóa cột
        handleSetActiveCard={handleSetActiveCard}
        handleDeleteColumn={handleDeleteColumn}

        // Truyền từ khóa tìm kiếm xuống để lọc card
        searchValue={searchValue}
      />

      {/* Hiển thị Modal Active Card */}
      <ActiveCardModal
        activeCard={activeCard}
        isOpen={isShowModalActiveCard}
        onClose={handleCloseModal}
        boardMembers={board?.members}
      />
    </Container>
  );
}

export default Board