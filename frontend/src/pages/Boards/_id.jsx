// src/pages/Boards/_id.jsx
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { mapOrder } from "~/utils/sorts";

// 1. Import useParams để lấy ID từ URL
import { useParams } from "react-router-dom";

// Import các API
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  deleteColumnAPI,
} from "~/apis/boardApi";
import { deleteCardAPI } from "~/apis/cardApi";
import { toast } from "react-toastify";

// Import Modal
import ActiveCardModal from "~/components/Modal/ActiveCardModal/ActiveCardModal";
import CardDetailModal from "~/components/Modal/CardDetailModal/CardDetailModal";

// 👇 IMPORT SOCKET
import { socket } from "~/socket";

function Board() {
  const [board, setBoard] = useState(null);

  // 2. State quản lý Modal Active Card
  const [activeCard, setActiveCard] = useState(null);
  const [isShowModalActiveCard, setIsShowModalActiveCard] = useState(false);

  // 3. State quản lý Tìm kiếm (Search)
  const [searchValue, setSearchValue] = useState("");

  // Lấy boardId từ URL (do router định nghĩa /boards/:boardId)
  const { boardId } = useParams();

  useEffect(() => {
    // Tách hàm gọi API ra để tái sử dụng
    const fetchBoardData = () => {
      fetchBoardDetailsAPI(boardId).then((boardData) => {
        // Sắp xếp thứ tự các cột
        boardData.columns = mapOrder(
          boardData.columns,
          boardData.columnOrderIds,
          "_id"
        );
        setBoard(boardData);
      });
    };

    // 1. Gọi API lấy dữ liệu lần đầu khi vào trang
    fetchBoardData();

    // 2. Cấu hình Real-time (Socket.IO)
    console.log("👋 [CLIENT B] Xin join room:", boardId);
    socket.emit("join_board", boardId);

    // 👇 Hàm xử lý reload có độ trễ 200ms để tránh Race Condition (Database chưa lưu kịp)
    const onReloadBoard = (data) => {
      console.log("🔔 [CLIENT B] Đã nhận được lệnh RELOAD!", data);
      setTimeout(() => {
        fetchBoardData();
      }, 200);
    };

    // Lắng nghe các sự kiện update từ Server
    // 👇 SỬA Ở ĐÂY: Dùng hàm onReloadBoard thay vì fetchBoardData trực tiếp
    socket.on("BE_UPDATE_LIST_ORDER", onReloadBoard);
    socket.on("BE_UPDATE_CARD_ORDER", onReloadBoard);
    socket.on("BE_RELOAD_BOARD", onReloadBoard);
    socket.on("FE_UPDATE_BOARD", onReloadBoard);
    // Cleanup function: Gỡ sự kiện khi component unmount
    return () => {
      socket.off("BE_UPDATE_LIST_ORDER", onReloadBoard);
      socket.off("BE_UPDATE_CARD_ORDER", onReloadBoard);
      socket.off("BE_RELOAD_BOARD", onReloadBoard);
      socket.off("FE_UPDATE_BOARD", onReloadBoard);
    };
  }, [boardId]);

  // 👇 THÊM ĐOẠN NÀY: Tự động cập nhật Modal khi Board thay đổi (Fix lỗi User B đang mở modal mà không thấy update)
  // TRONG src/pages/Boards/_id.jsx

  // 👇 THÊM ĐOẠN NÀY: Tự động cập nhật Modal khi Board thay đổi
  useEffect(() => {
    console.log(
      "🐛 [DEBUG] Board state changed, checking activeCard update..."
    );
    if (activeCard && board) {
      let newActiveCard = null;

      // Bước 1: Tìm Card mới nhất trong Board mới
      for (let column of board.columns) {
        const foundCard = column.cards?.find((c) => c._id === activeCard._id);
        if (foundCard) {
          newActiveCard = foundCard;
          break;
        }
      }

      // Bước 2: Cập nhật activeCard nếu tìm thấy và có thay đổi
      if (newActiveCard) {
        // DEBUG: So sánh dữ liệu cũ và mới
        if (newActiveCard.description !== activeCard.description) {
          console.log(
            "🐛 [DEBUG] Cập nhật Description: TỪ",
            activeCard.description,
            "ĐẾN",
            newActiveCard.description
          );
        }
        if (newActiveCard.comments?.length !== activeCard.comments?.length) {
          console.log(
            "🐛 [DEBUG] Cập nhật Comments: SỐ LƯỢNG MỚI:",
            newActiveCard.comments?.length
          );
        }

        // CHỈ CẬP NHẬT NẾU THỰC SỰ CÓ THAY ĐỔI DỮ LIỆU CARD
        // (Điều này tránh lặp vô tận, mặc dù React thường xử lý việc này)
        setActiveCard(newActiveCard);
        console.log("🐛 [DEBUG] activeCard đã được CẬP NHẬT thành công.");
      } else {
        console.log(
          "🐛 [DEBUG] activeCard không tìm thấy trong dữ liệu Board mới nhất."
        );
      }
    }
  }, [board]); // activeCard cũng là dependency, nhưng [board] đã đủ để trigger khi board thay đổi.

  // --- CÁC HÀM XỬ LÝ MODAL ---
  const handleSetActiveCard = (card) => {
    setActiveCard(card);
    setIsShowModalActiveCard(true);
  };

  const handleCloseModal = () => {
    setIsShowModalActiveCard(false);
    setActiveCard(null);
  };

  // --- CÁC HÀM XỬ LÝ DỮ LIỆU (CRUD) ---

  // 1. Tạo Column mới
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });

    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
    socket.emit("FE_UPDATE_BOARD", { boardId: board._id });
  };

  // 2. Tạo Card mới
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      title: newCardData.title,
      listId: newCardData.columnId,
    });

    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (c) => c._id === createdCard.columnId
    );

    if (columnToUpdate) {
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    setBoard(newBoard);
    socket.emit("FE_UPDATE_BOARD", { boardId: board._id });
  };

  // 3. Xóa Column
  const handleDeleteColumn = async (columnId) => {
    // Cập nhật UI ngay lập tức (Optimistic UI)
    const newBoard = { ...board };
    newBoard.columns = newBoard.columns.filter((c) => c._id !== columnId);
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
      (_id) => _id !== columnId
    );
    setBoard(newBoard);

    // Gọi API
    try {
      await deleteColumnAPI(columnId);
      toast.success("Đã xóa cột thành công");
      socket.emit("FE_UPDATE_BOARD", { boardId: board._id });
    } catch (error) {
      toast.error("Lỗi xóa cột");
    }
  };
  // 4. Xoa Card
  const handleDeleteCard = async (card) => {
    // 1. Optimistic UI
    const newBoard = { ...board };
    const column = newBoard.columns.find((c) => c._id === card.columnId);

    if (column) {
      column.cards = column.cards.filter((c) => c._id !== card._id);
      column.cardOrderIds = column.cardOrderIds.filter((id) => id !== card._id);
    }

    setBoard(newBoard);

    // 2. Đóng modal NGAY
    setIsShowModalActiveCard(false);
    setActiveCard(null);

    // 3. Gọi API
    try {
      await deleteCardAPI(card._id);
      toast.success("Đã xóa thẻ thành công");
      socket.emit("FE_UPDATE_BOARD", { boardId: board._id });
    } catch (error) {
      toast.error("Lỗi xóa thẻ");
    }
  };

  if (!board) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Board...
      </div>
    );
  }
  const handleUpdateActiveCard = (newCardData) => {
    setActiveCard(newCardData);

    // Cập nhật Card này vào mảng Columns/Cards của Board (Rất quan trọng cho đồng bộ UI)
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (c) => c._id === newCardData.columnId
    );

    if (columnToUpdate) {
      const cardIndex = columnToUpdate.cards.findIndex(
        (c) => c._id === newCardData._id
      );
      if (cardIndex !== -1) {
        columnToUpdate.cards[cardIndex] = newCardData;
      }
    }
    setBoard(newBoard);

    // Vẫn giữ lệnh emit socket (dù đang lỗi)
    socket.emit("FE_UPDATE_BOARD", { boardId: newBoard._id });
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
      {/* Truyền props tìm kiếm xuống AppBar */}
      <AppBar searchValue={searchValue} setSearchValue={setSearchValue} />

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
      {/* <ActiveCardModal
        activeCard={activeCard}
        isOpen={isShowModalActiveCard}
        onClose={handleCloseModal}
        boardMembers={board?.members}
      /> */}
      <CardDetailModal
        open={isShowModalActiveCard}
        onClose={handleCloseModal}
        card={activeCard}
        boardMembers={board?.members}
        onDeleteCard={handleDeleteCard}
        onUpdateActiveCard={handleUpdateActiveCard}
      />
    </Container>
  );
}

export default Board;
