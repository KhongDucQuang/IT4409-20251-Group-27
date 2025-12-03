// src/pages/Boards/_id.jsx
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { mapOrder } from '~/utils/sorts';
import { isEmpty } from 'lodash';

// 1. Import useParams để lấy ID từ URL
import { useParams } from 'react-router-dom';

// Import các API
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, deleteColumnAPI } from '~/apis/boardApi';
import { generatePlaceholderCard } from '~/utils/formatter';
import { useConfirm } from 'material-ui-confirm'
// Import Modal
import ActiveCardModal from '~/components/Modal/ActiveCardModal/ActiveCardModal';

function Board() {
  const [board, setBoard] = useState(null);
  
  // 2. State quản lý Modal Active Card
  const [activeCard, setActiveCard] = useState(null);
  const [isShowModalActiveCard, setIsShowModalActiveCard] = useState(false);

  // Lấy boardId từ URL (do router định nghĩa /boards/:boardId)
  const { boardId } = useParams();

  useEffect(() => {
    // Gọi API lấy thông tin board dựa vào ID trên URL
    fetchBoardDetailsAPI(boardId).then(boardData => {
      setBoard(boardData);
      
      // Sắp xếp thứ tự các cột (nếu cần thiết, dù backend đã sort)
      boardData.columns = mapOrder(boardData.columns, boardData.columnOrderIds, '_id');
      setBoard(boardData);
    });
  }, [boardId]);

  // 3. Hàm xử lý mở Modal (truyền xuống dưới cho Card click)
  const handleSetActiveCard = (card) => {
    setActiveCard(card);
    setIsShowModalActiveCard(true);
  };

  // 4. Hàm đóng Modal
  const handleCloseModal = () => {
    setIsShowModalActiveCard(false);
    setActiveCard(null);
  };

  // Hàm xử lý tạo Column mới
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    });

    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
  };

  // Hàm xử lý tạo Card mới
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      title: newCardData.title,
      listId: newCardData.columnId
    });

    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(c => c._id === createdCard.columnId);

    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    setBoard(newBoard);
  };

  // Hàm xử lý xóa Column
  const handleDeleteColumn = async (columnId) => {
    // 1. Cập nhật UI ngay lập tức (Optimistic UI) cho mượt
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)

    // 2. Gọi API
    try {
      await deleteColumnAPI(columnId)
      toast.success('Đã xóa cột thành công')
    } catch (error) {
      toast.error('Lỗi xóa cột')
      // Nếu lỗi thì phải rollback lại state (nâng cao, tạm thời bỏ qua)
    }
  }

  if (!board) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Board...
      </div>
    );
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        // 5. Truyền hàm mở modal xuống BoardContent
        handleSetActiveCard={handleSetActiveCard}
        handleDeleteColumn={handleDeleteColumn}
      />

      {/* 6. Hiển thị Modal tại đây */}
      <ActiveCardModal 
        activeCard={activeCard}
        isOpen={isShowModalActiveCard}
        onClose={handleCloseModal}
        boardMembers={board?.members}
      />
    </Container>
  );
}

export default Board;