// CardDetailModal.jsx

import React, { useState, useEffect, useRef } from "react";

// 1. External UI/Design Imports (MUI)
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  Button, // Import Button trực tiếp từ @mui/material
  Avatar, // Import Avatar trực tiếp từ @mui/material
  LinearProgress, // Import LinearProgress trực tiếp từ @mui/material
} from "@mui/material";

// 2. Icon Imports
import CloseIcon from "@mui/icons-material/Close";
import CheckListIcon from "@mui/icons-material/Checklist";
import LabelIcon from "@mui/icons-material/Label";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import Stack from "@mui/material/Stack";
import AttachmentIcon from "@mui/icons-material/Attachment";

// 3. Local Component Imports
import AddChecklistModal from "./Modals/AddChecklistModal";
import ManageMembersModal from "./Modals/ManageMembersModal";
import AttachFileModal from "./Modals/AttachFileModal";
import ManageLabelsModal from "./Modals/ManageLabelsModal";
import ManageDateModal from "./Modals/ManageDateModal";

// 4. Utility/API Imports
import { socket } from "~/socket";
import { toast } from "react-toastify";
import {
  updateCardDetailsAPI,
  createNewCommentAPI,
  // Dùng cho tương lai
  assignMemberAPI,
  unassignMemberAPI,
} from "~/apis/cardApi";
import {
  deleteChecklistAPI,
  createChecklistItemAPI,
  updateChecklistItemAPI,
  deleteChecklistItemAPI,
} from "~/apis/cardApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en"; // Đảm bảo chỉ import một lần
import { API_ROOT } from "~/utils/constants";

dayjs.extend(relativeTime);
dayjs.locale("en");

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

// =================================================================
// 5. Styles & Constants
// =================================================================

const style = {
  position: "absolute",
  top: 60,
  left: "50%",
  transform: "translateX(-50%)",
  width: "90%",
  maxWidth: 1100,
  height: "auto",
  minHeight: "50vh",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  borderRadius: "8px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,

  // MEDIA QUERIES
  "@media (max-width: 600px)": {
    width: "100%",
    height: "100%",
    maxHeight: "100vh",
    borderRadius: 0,
    p: 2,
    transform: "none",
    top: 0,
    left: 0,
  },
  "@media (min-width: 601px) and (max-width: 960px)": {
    width: "95%",
    p: 3,
  },
};

// Style cho Typography và TextField tiêu đề
const titleStyle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  lineHeight: "1.6",
};

const wrapperPadding = {
  py: "0px",
  px: "0px",
  mx: "0px",
  my: "0px",
  borderRadius: "4px",
};

// =================================================================
// 6. Component Definition
// =================================================================

function CardDetailModal({ open, onClose, card, boardMembers, onDeleteCard }) {
  // Guard clause: Nếu card không có thì không render
  if (!card) return null;
  const [cardData, setCardData] = useState(card);
  // Sync state khi prop 'card' từ bên ngoài thay đổi
  useEffect(() => {
    setCardData(card);
  }, [card]);
  // --- States ---
  const [isCompleted, setIsCompleted] = useState(
    cardData?.isCompleted || false
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(cardData?.title || "");

  const [editingDescription, setEditingDescription] = useState(
    cardData?.description || ""
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false); // Đổi tên state cho rõ ràng

  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [newItemContent, setNewItemContent] = useState("");
  const [comment, setComment] = useState("");
  const [hideCheckedMap, setHideCheckedMap] = useState({});

  // --- Modal States ---
  const [openAddChecklist, setOpenAddChecklist] = useState(false);
  const [openManageMembers, setOpenManageMembers] = useState(false);
  const [openAttachFile, setOpenAttachFile] = useState(false);
  const [openManageLabels, setOpenManageLabels] = useState(false);
  const [openManageDate, setOpenManageDate] = useState(false);
  const [checklistIdOpenForm, setChecklistIdOpenForm] = useState(null); // Lưu ID của checklist đang mở form
  const [forceUpdate, setForceUpdate] = useState(false);

  // --- Effects ---

  // Đọc thông tin người dùng từ localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setLoggedInUser(user);
      } catch (error) {
        console.error("Lỗi khi parse userInfo từ localStorage:", error);
      }
    }
  }, [open]); // Chạy lại khi modal mở

  // Cập nhật titleInput khi prop card thay đổi (trong trường hợp mở modal cho card khác)
  useEffect(() => {
    setTitleInput(cardData?.title || "");
    setEditingDescription(cardData?.description || "");
    setIsCompleted(cardData?.isCompleted || false);
  }, [card]);

  // --- Handlers cho Modals ---

  const handleOpenAddChecklist = () => {
    setOpenAddChecklist(true);
  };
  const handleCloseAddChecklist = () => setOpenAddChecklist(false);

  const handleOpenManageMembers = () => setOpenManageMembers(true);
  const handleCloseManageMembers = () => setOpenManageMembers(false);

  const handleOpenAttachFile = () => setOpenAttachFile(true);
  const handleCloseAttachFile = () => setOpenAttachFile(false);

  const handleOpenManageLabels = () => setOpenManageLabels(true);
  const handleCloseManageLabels = () => setOpenManageLabels(false);

  const handleOpenManageDate = () => setOpenManageDate(true);
  const handleCloseManageDate = () => setOpenManageDate(false);

  // --- Handlers cho Card Details ---

  const handleToggleCompleted = async (e) => {
    const newState = e.target.checked;
    setIsCompleted(newState);

    try {
      await updateCardDetailsAPI(cardData._id, { isCompleted: newState });
      // Cập nhật trực tiếp trên prop card (nếu được phép hoặc là một bản copy)
      cardData.isCompleted = newState;
      toast.success(`Card đã ${newState ? "hoàn thành" : "đã được mở lại"}!`);
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
      setIsCompleted(!newState); // Rollback nếu thất bại
    }
  };

  // 1. Inline Edit Title - Save
  const handleSaveTitle = async () => {
    const newTitle = titleInput.trim();

    if (newTitle !== cardData.title && newTitle !== "") {
      try {
        await updateCardDetailsAPI(cardData._id, { title: newTitle });
        setCardData((prev) => ({
          ...prev,
          title: newTitle,
        })); // Cập nhật ngay lập tức
        toast.success("Đổi tên thẻ thành công!");
        socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
      } catch (error) {
        toast.error("Lỗi đổi tên thẻ");
        setTitleInput(cardData.title); // Rollback
      }
    } else if (newTitle === "") {
      // Ngăn không cho để trống
      setTitleInput(cardData.title);
    }

    setIsEditingTitle(false);
  };

  // 2. Inline Edit Title - KeyDown
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    }
  };

  // 3. Description - Save
  const handleSaveDescription = async () => {
    const trimmedDescription = editingDescription.trim();
    if (trimmedDescription === cardData.description) {
      setIsEditingDescription(false);
      return;
    }

    try {
      await updateCardDetailsAPI(cardData._id, {
        description: trimmedDescription,
      });
      cardData.description = trimmedDescription; // Cập nhật ngay lập tức
      toast.success("Cập nhật mô tả thành công!");
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
      setIsEditingDescription(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật mô tả");
    }
  };

  // 4. Description - Cancel
  const handleCancelEditDescription = () => {
    setEditingDescription(cardData.description || "");
    setIsEditingDescription(false);
  };

  // --- HANDLER CHO COMMENT ---
  // 1. Post Comment
  const handlePostComment = async () => {
    if (!commentText.trim() || !loggedInUser) return; // Kiểm tra loggedInUser

    try {
      const newComment = await createNewCommentAPI(cardData._id, {
        content: commentText.trim(),
      });

      // --- SỬA LỖI 2: Đảm bảo dữ liệu người dùng đầy đủ ---
      // Nếu API không trả về đối tượng 'user' đầy đủ, ta phải tự bổ sung
      // để logic so sánh quyền sở hữu hoạt động ngay lập tức.
      const commentWithUser = {
        ...newComment,
        userId: loggedInUser._id,
        // Giả định: Thông tin user cần thiết để so sánh
        user: newComment.user || {
          id: loggedInUser._id,
          name: loggedInUser.fullName || loggedInUser.email,
          avatarUrl: loggedInUser.avatarUrl,
        },
      };

      // --- SỬA LỖI 1: Cập nhật state một cách bất biến (IMMUTABLE UPDATE) ---
      setCardData((prevCard) => ({
        ...prevCard,
        // Tạo mảng comments mới bằng cách thêm commentWithUser vào đầu
        comments: [commentWithUser, ...(prevCard.comments || [])],
      }));

      setCommentText("");
      setIsCommenting(false);

      toast.success("Bình luận đã được đăng!");

      // Emit socket sau khi cập nhật state thành công
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      console.error(error);
      toast.error("Gửi bình luận thất bại");
    }
  };
  // 2. Cancel Comment
  const handleCancelComment = () => {
    setCommentText("");
    setIsCommenting(false);
  };

  // 3. Reply Comment
  const handleReply = (userName) => {
    setCommentText(`@${userName} `);
    setIsCommenting(true);
    // (Thêm logic focus vào TextField nếu sử dụng useRef)
    // 3. ĐẶT FOCUS VÀO TEXTFIELD SAU KHI CẬP NHẬT STATE
    // Dùng setTimeout nhỏ để đảm bảo state đã được cập nhật
    setTimeout(() => {
      if (commentInputRef.current) {
        // Focus vào element
        commentInputRef.current.focus();

        // Di chuyển con trỏ chuột đến cuối nội dung (optional, nhưng tốt cho UX)
        const len = commentInputRef.current.value.length;
        commentInputRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  // 4. Edit Comment (GIẢ LẬP - Cần triển khai API thực tế)
  const handleSaveEdit = (commentId) => {
    if (!editingContent.trim()) return;
    toast.info("Chức năng sửa bình luận đang được phát triển.");

    // Cần gọi API cập nhật bình luận
    console.log(
      `Cập nhật bình luận ${commentId} với nội dung: ${editingContent}`
    );

    // Dùng logic update tạm thời:
    // const commentIndex = cardData.comments.findIndex((c) => c._id === commentId);
    // if (commentIndex > -1) {
    //   cardData.comments[commentIndex].content = editingContent.trim();
    //   cardData.comments[commentIndex].updatedAt = new Date().toISOString(); // Cập nhật thời gian
    // }
    setEditingCommentId(null);
    setEditingContent("");

    socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
  };

  // 5. Delete Comment (GIẢ LẬP - Cần triển khai API thực tế)
  const handleDeleteComment = (commentId) => {
    toast.warn("Chức năng xóa bình luận đang được phát triển.");

    // Cần gọi API xóa bình luận
    console.log(`Xóa bình luận ${commentId}`);

    // Dùng logic xóa tạm thời:
    cardData.comments = cardData.comments.filter((c) => c._id !== commentId);
    socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
  };
  // 6. TẠO REF để trỏ đến ô nhập comment
  const commentInputRef = useRef(null);

  // --- XỬ LÝ CHECKLIST ---
  // 1. Hàm gọi API tạo checklist mới
  // 2. Hàm xóa checklist
  const handleDeleteChecklist = async (checklistId) => {
    try {
      // 1. Gọi API xóa
      await deleteChecklistAPI(checklistId);

      // 2. Cập nhật dữ liệu Local (Lọc bỏ cái vừa xóa)
      // Lưu ý: Kiểm tra kỹ xem backend trả về là "id" hay "_id". Thường là "id" nếu bạn đã map, hoặc "_id" nếu là raw Mongo.
      // Ở đây mình dùng logic an toàn: cardData.checklists đang hiển thị cái gì thì lọc theo cái đó.
      cardData.checklists = cardData.checklists.filter(
        (c) => c.id !== checklistId && c._id !== checklistId
      );

      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate((prev) => !prev);

      // 3. Bắn socket cho User B
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      console.error("Delete checklist error:", error);
      toast.error("Lỗi xóa checklist");
    }
  };

  // --- XỬ LÝ CHECKLIST ITEMS ---
  // 1. Hàm gọi API thêm item (Logic gốc)
  const handleAddItem = async (checklistId, content) => {
    try {
      const newItem = await createChecklistItemAPI(checklistId, content);
      const checklist = cardData.checklists.find((c) => c.id === checklistId);
      if (checklist) {
        if (!checklist.items) checklist.items = [];
        checklist.items.push(newItem);
      }
      setComment((prev) => prev);

      // ✅
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      console.error("Add checklist item error:", error);
      toast.error("Lỗi thêm việc");
    }
  };

  // 2. Hàm xử lý sự kiện Submit Form (Dùng cho cả nút Thêm và phím Enter)
  const handleAddItemSubmit = async (checklistId) => {
    if (!newItemContent.trim()) return;
    await handleAddItem(checklistId, newItemContent);
    setNewItemContent("");
    // Không cần emit ở đây vì hàm handleAddItem đã emit rồi
  };

  // 3. Hàm tick chọn (Đã sửa lỗi không cập nhật ngay)
  const handleToggleItem = async (itemId, currentStatus) => {
    // Optimistic UI
    const newStatus = !currentStatus;
    cardData.checklists.forEach((list) => {
      const item = list.items.find((i) => i.id === itemId);
      if (item) item.isCompleted = newStatus;
    });
    setForceUpdate((prev) => !prev);

    try {
      await updateChecklistItemAPI(itemId, { isCompleted: newStatus });

      // ✅
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
      // Rollback
      cardData.checklists.forEach((list) => {
        const item = list.items.find((i) => i.id === itemId);
        if (item) item.isCompleted = currentStatus;
      });
      setForceUpdate((prev) => !prev);
    }
  };
  // 4. Hàm xóa item (Đã sửa lỗi không cập nhật ngay)
  const handleDeleteItem = async (itemId) => {
    // 1. Optimistic UI: Xóa trên giao diện NGAY LẬP TỨC
    // Sử dụng map để tạo mảng mới thay vì sửa trực tiếp, giúp React nhận biết thay đổi
    const newChecklists = cardData.checklists.map((list) => {
      if (list.items) {
        return {
          ...list,
          items: list.items.filter((i) => i.id !== itemId),
        };
      }
      return list;
    });

    cardData.checklists = newChecklists; // Gán lại mảng mới
    setForceUpdate((prev) => !prev); // Ép vẽ lại

    // 2. Gọi API xóa ngầm bên dưới
    try {
      await deleteChecklistItemAPI(itemId);

      // 3. Bắn socket cho User B cập nhật
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      toast.error("Lỗi xóa việc");
    }
  };
  // 5. hàm ẩn/hiện việc đã check
  const handleToggleHideChecked = (checklistId) => {
    setHideCheckedMap((prev) => ({
      ...prev,
      [checklistId]: !prev[checklistId],
    }));
  };

  // --- DROP MENU ATTACHMENTS ---
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAtt, setSelectedAtt] = useState(null);

  const menuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event, att) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAtt(att);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedAtt(null);
  };

  // Download file attached
  const handleDownload = async () => {
    if (!selectedAtt) return;

    try {
      const response = await fetch(`${API_ROOT}/${selectedAtt.url}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = selectedAtt.fileName || "file";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Download thất bại");
    } finally {
      handleCloseMenu();
    }
  };

  // Delete (gắn API sau)
  const handleDelete = async () => {
    if (!selectedAtt) return;

    try {
      await deleteAttachmentAPI(selectedAtt._id);
      cardData.attachments = cardData.attachments.filter(
        (att) => att._id !== selectedAtt._id
      );
      toast.success("Xóa file thành công");
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (err) {
      toast.error("Tính năng đang phát triển");
    } finally {
      handleCloseMenu();
    }
  };

  // --- DROP MENU XÓA CARD ---
  const [anchorElCard, setAnchorElCard] = useState(null);
  const menuOpenCard = Boolean(anchorElCard);

  const handleOpenMenuCard = (event) => {
    event.stopPropagation();
    setAnchorElCard(event.currentTarget);
  };

  const handleCloseMenuCard = () => {
    setAnchorElCard(null);
  };

  const handleDeleteCard = async () => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn thẻ "${cardData?.title}" không?`
    );

    if (!isConfirmed) return;

    onDeleteCard(card);
  };

  // --- XỬ LÝ ASSIGN MEMBERS ---

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="card-detail-title"
      aria-describedby="card-detail-description"
    >
      <Box sx={style}>
        {/* 1. Header/Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon color="success" />}
            checked={isCompleted}
            onChange={handleToggleCompleted}
            size="medium"
            sx={{ p: 0 }}
          />

          {isEditingTitle ? (
            <TextField
              fullWidth
              variant="standard"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              autoFocus
              multiline
              InputProps={{
                disableUnderline: true,
                style: {
                  ...titleStyle,
                  ...wrapperPadding,
                  lineHeight: "1.25",
                },
              }}
              sx={{ flexGrow: 1 }}
              inputRef={(input) => {
                if (input) {
                  const len = input.value.length;
                  input.setSelectionRange(len, len);
                }
              }}
            />
          ) : (
            <Typography
              id="card-detail-title"
              component="h2"
              onClick={() => setIsEditingTitle(true)}
              sx={{
                ...titleStyle,
                ...wrapperPadding,
                cursor: "pointer",
                flexGrow: 1,
                textDecoration: isCompleted ? "line-through" : "none",
                opacity: isCompleted ? 0.7 : 1,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.05)",
                },
              }}
            >
              {cardData.title}
            </Typography>
          )}
          <IconButton size="small">
            <MoreHorizIcon
              fontSize="small"
              onClick={(e) => handleOpenMenuCard(e)}
            />
          </IconButton>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorElCard}
          open={menuOpenCard}
          onClose={handleCloseMenuCard}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleDeleteCard} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
        {/* ===== MAIN CONTENT: FLEX LAYOUT (LEFT/RIGHT) ===== */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexGrow: 1,
            minHeight: 0,
            "@media (max-width: 600px)": {
              flexDirection: "column",
            },
          }}
        >
          {/* CỘT TRÁI (Main Details: Actions, Description, Checklists, Attachments) */}
          <Box
            sx={{
              flex: 2,
              minWidth: 0,
              overflowY: "auto",
              paddingRight: 1,
              pb: 4,
            }}
          >
            {/* 2. Action Buttons */}
            <Box
              sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1, mb: 4 }}
            >
              <Button
                variant="outlined"
                startIcon={<CheckListIcon />}
                onClick={handleOpenAddChecklist}
              >
                Checklist
              </Button>
              <Button
                variant="outlined"
                startIcon={<LabelIcon />}
                onClick={handleOpenManageLabels}
              >
                Labels
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarTodayIcon />}
                onClick={handleOpenManageDate}
              >
                Dates
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenManageMembers}
              >
                Member
              </Button>
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={handleOpenAttachFile}
              >
                Attached
              </Button>
            </Box>

            {/* ===== META INFO (Members / Labels / Due date) (Dữ liệu giả lập) ===== */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              {/* MEMBERS */}
              <Box sx={{ minWidth: 160 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  Members
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "nowrap" }}
                >
                  {/* ... Thay thế bằng cardData.memberIds.map ... (Dữ liệu giả lập) */}
                  <Avatar
                    sx={{
                      bgcolor: "#26c6da",
                      width: 32,
                      height: 32,
                      fontSize: 13,
                    }}
                  >
                    QN
                  </Avatar>
                  <Avatar
                    sx={{
                      bgcolor: "#7e57c2",
                      width: 32,
                      height: 32,
                      fontSize: 13,
                    }}
                  >
                    QM
                  </Avatar>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "action.hover",
                      cursor: "pointer",
                    }}
                    onClick={handleOpenManageMembers}
                  >
                    +
                  </Avatar>
                </Box>
              </Box>

              {/* LABELS */}
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  Labels
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    flexWrap: "wrap",
                    rowGap: 1,
                  }}
                >
                  {/* ... Thay thế bằng cardData.labelIds.map ... (Dữ liệu giả lập) */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "#2e7d32",
                      color: "#fff",
                      borderRadius: 1,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    xyynijknkj
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "#1565c0",
                      color: "#fff",
                      borderRadius: 1,
                      fontSize: 13,
                      fontWeight: 500,
                      border: "2px solid #fff",
                    }}
                  >
                    abc
                  </Box>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={handleOpenManageLabels}
                  >
                    +
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* DUE DATE */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2, fontSize: 13 }}
              >
                Due date
              </Typography>
              {/* ... Thay thế bằng cardData.dueDate ... (Dữ liệu giả lập) */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">Dec 15, 11:36 AM</Typography>
                <Box
                  sx={{
                    px: 1,
                    py: "2px",
                    bgcolor: "#fbc02d",
                    borderRadius: 0.5,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Due soon
                </Box>
              </Box>
            </Box>

            {/* 3. Description */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="More detailed description..."
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                onFocus={() => setIsEditingDescription(true)}
              />

              {isEditingDescription && (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button variant="contained" onClick={handleSaveDescription}>
                    Save
                  </Button>
                  <Button variant="text" onClick={handleCancelEditDescription}>
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            {/* ===== CHECKLISTS ===== */}
            <Box sx={{ mt: 4 }}>
              {cardData?.checklists?.length > 0 &&
                cardData.checklists.map((checklist) => {
                  const totalItems = checklist.items?.length || 0;
                  const completedItems =
                    checklist.items?.filter((i) => i.isCompleted)?.length || 0;
                  const progress =
                    totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

                  const visibleItems = hideCheckedMap[checklist.id]
                    ? checklist.items?.filter((item) => !item.isCompleted)
                    : checklist.items;
                  return (
                    <Box key={checklist.id} sx={{ mb: 3 }}>
                      {/* Header Checklist */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckListIcon fontSize="small" />
                          <Typography variant="h6">
                            {checklist.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Nút Hide checked items */}
                          <Button
                            size="small"
                            variant="text"
                            sx={{ textTransform: "none" }}
                            onClick={() =>
                              handleToggleHideChecked(checklist.id)
                            }
                          >
                            {hideCheckedMap[checklist.id]
                              ? "Show checked items"
                              : "Hide checked items"}
                          </Button>

                          {/* Nút Delete */}
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteChecklist(checklist.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>

                      {/* Progress Bar */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ width: 40 }}>
                          {Math.round(progress)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress} // Giá trị tính theo %
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: (theme) => theme.palette.action.hover, // Màu nền chưa hoàn thành
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#5BA4CF", // Màu thanh progress
                            },
                          }}
                        />
                      </Box>

                      {/* List Items */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        {visibleItems?.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={item.isCompleted}
                              onChange={() =>
                                handleToggleItem(item.id, item.isCompleted)
                              }
                              sx={{ p: 0.5 }}
                            />
                            <TextField
                              fullWidth
                              variant="standard"
                              value={item.content}
                              InputProps={{
                                disableUnderline: true,
                                readOnly: true,
                              }} // Tạm thời readOnly
                              sx={{
                                textDecoration: item.isCompleted
                                  ? "line-through"
                                  : "none",
                                color: item.isCompleted
                                  ? "text.secondary"
                                  : "text.primary",
                              }}
                            />
                            <CloseIcon
                              fontSize="small"
                              sx={{
                                cursor: "pointer",
                                color: "#ddd",
                                "&:hover": { color: "error.main" },
                              }}
                              onClick={() => handleDeleteItem(item.id)}
                            />
                          </Box>
                        ))}
                      </Stack>

                      {/* Add New Item Button */}
                      {/* Form thêm item mới (Thay thế cho nút Add cũ) */}
                      <Box sx={{ pl: 4 }}>
                        {checklistIdOpenForm !== checklist.id ? (
                          // 1. Trạng thái bình thường: Hiển thị nút "Add an item"
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              mt: 1,
                              textTransform: "none",
                              bgcolor: "action.hover",
                              color: "text.primary",
                            }}
                            onClick={() => setChecklistIdOpenForm(checklist.id)}
                          >
                            Add an item
                          </Button>
                        ) : (
                          // 2. Trạng thái đang nhập: Hiển thị Form Input
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              autoFocus
                              multiline
                              minRows={2}
                              placeholder="Add an item..."
                              value={newItemContent}
                              onChange={(e) =>
                                setNewItemContent(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddItemSubmit(checklist.id);
                                }
                              }}
                              sx={{
                                mb: 1,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleAddItemSubmit(checklist.id)
                                }
                                disabled={!newItemContent.trim()}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 500,
                                  px: 2,
                                }}
                              >
                                Add
                              </Button>

                              <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                  setChecklistIdOpenForm(null);
                                  setNewItemContent("");
                                }}
                                sx={{
                                  textTransform: "none",
                                  color: "text.secondary",
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
            </Box>

            {/* ===== ATTACHMENTS ===== */}
            <Box sx={{ mt: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachFileIcon fontSize="small" />
                  <Typography variant="h6">Attachments</Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleOpenAttachFile}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Danh sách file */}
                <Stack spacing={1.5}>
                  {cardData?.attachments?.map((att) => (
                    <Box
                      key={att._id || att.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      {/* Thumbnail / Icon */}
                      <Box
                        sx={{
                          width: 48,
                          height: 40,
                          minWidth: 48,
                          minHeight: 40,
                          borderRadius: 1,
                          bgcolor: "background.paper",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12,
                          color: "text.secondary",
                          overflow: "hidden",
                          flexShrink: 0, // ⛔ không bị co khi flex
                        }}
                      >
                        {att.mimeType?.includes("image") ? (
                          <img
                            src={`${API_ROOT}/${att.url}`}
                            alt={att.fileName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          (() => {
                            const parts = att.fileName?.split(".");
                            return parts && parts.length > 1
                              ? parts.pop().toUpperCase()
                              : "FILE";
                          })()
                        )}
                      </Box>

                      {/* Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography fontWeight={600}>{att.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(att.uploadedAt).toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Open */}
                      <IconButton
                        size="small"
                        component="a"
                        href={`${API_ROOT}/${att.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>

                      {/* More */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, att)}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={handleDownload}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Download" />
                  </MenuItem>

                  <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                    <ListItemIcon sx={{ color: "error.main" }}>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
          {/* END CỘT TRÁI */}

          {/* CỘT PHẢI (Comments) */}
          <Box sx={{ flex: 1, minWidth: 280, overflowY: "auto", p: 1 }}>
            <Box sx={{ mt: 2, mb: 4 }}>
              <Typography variant="h6">Comments</Typography>
              {/* Comment Input */}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {/* Avatar người dùng hiện tại (Dữ liệu giả lập) */}
                <Avatar
                  sx={{
                    bgcolor: loggedInUser?.avatarColor || "#5c6bc0",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  {loggedInUser?.name
                    ? loggedInUser.name.substring(0, 2).toUpperCase()
                    : "Me"}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={isCommenting ? 3 : 1}
                    placeholder="Write a comment..."
                    variant="outlined"
                    size="small"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onFocus={() => setIsCommenting(true)}
                    sx={{ transition: "rows 0.3s" }}
                    inputRef={commentInputRef}
                  />
                  {isCommenting && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handlePostComment}
                        disabled={!commentText.trim()}
                      >
                        Save
                      </Button>
                      <Button variant="text" onClick={handleCancelComment}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Danh sách Comments */}
              <Box sx={{ mt: 2 }}>
                {cardData?.comments?.map((commentItem) => {
                  const commentUserId = // Đã bao gồm nhiều trường hợp
                    (
                      commentItem.user?.id ||
                      commentItem.user?._id || // <-- Thêm kiểm tra _id
                      commentItem.user ||
                      commentItem.userId
                    )
                      ?.toString()
                      .trim();

                  // SỬA LỖI Ở ĐÂY: Ưu tiên _id, sau đó là id
                  const currentUserId = (loggedInUser?._id || loggedInUser?.id)
                    ?.toString()
                    .trim();
                  const isMyComment =
                    currentUserId &&
                    commentUserId &&
                    currentUserId === commentUserId;

                  const isCurrentlyEditing =
                    editingCommentId === commentItem.id;
                  const commentUser = commentItem.user;
                  return (
                    <Box
                      key={commentItem._id}
                      sx={{ display: "flex", gap: 1, mb: 2 }}
                    >
                      {/* 1. Avatar */}
                      <Avatar
                        sx={{
                          bgcolor: commentUser?.avatarColor || "#7e57c2",
                          width: 32,
                          height: 32,
                          fontSize: 14,
                        }}
                        alt={commentUser?.name}
                        src={commentUser?.avatarUrl}
                      >
                        {commentUser?.name
                          ? commentUser.name.substring(0, 2).toUpperCase()
                          : "AN"}
                      </Avatar>

                      {/* 2. Nội dung Comment */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {commentUser?.name || "Anonymous"}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {commentItem.createdAt
                              ? dayjs(commentItem.createdAt).fromNow()
                              : "Unknown time"}
                          </Typography>
                        </Typography>

                        {/* EDIT MODE / VIEW MODE */}
                        {isCurrentlyEditing ? (
                          <Box>
                            <TextField
                              fullWidth
                              size="small"
                              value={editingContent}
                              onChange={(e) =>
                                setEditingContent(e.target.value)
                              }
                              multiline
                              autoFocus
                            />
                            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleSaveEdit(commentItem.id)}
                                disabled={!editingContent.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                onClick={() => setEditingCommentId(null)}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: 1,
                              p: 1,
                              mt: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {commentItem.content}
                            </Typography>
                          </Box>
                        )}

                        {/* ACTIONS (REPLY / EDIT / DELETE) */}
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          {!isMyComment && (
                            <Button
                              size="small"
                              sx={{ textTransform: "none" }}
                              onClick={() => handleReply(commentUser?.name)}
                            >
                              Reply
                            </Button>
                          )}

                          {isMyComment && !isCurrentlyEditing && (
                            <>
                              <Button
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => {
                                  setEditingContent(commentItem.content);
                                  setEditingCommentId(commentItem.id);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                sx={{ textTransform: "none" }}
                                onClick={() =>
                                  handleDeleteComment(commentItem.id)
                                }
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
          {/* END CỘT PHẢI */}
        </Box>
        {/* END MAIN CONTENT */}

        {/* ================= MODALS ================= */}
        <AddChecklistModal
          open={openAddChecklist}
          onClose={handleCloseAddChecklist}
          card={card}
        />
        <ManageMembersModal
          open={openManageMembers}
          onClose={handleCloseManageMembers}
          card={card}
          boardMembers={boardMembers}
        />
        <AttachFileModal
          open={openAttachFile}
          onClose={handleCloseAttachFile}
          card={card}
        />
        <ManageLabelsModal
          open={openManageLabels}
          onClose={handleCloseManageLabels}
          cardId={cardData._id}
        />
        <ManageDateModal
          open={openManageDate}
          onClose={handleCloseManageDate}
          cardId={cardData._id}
          card={card}
        />
      </Box>
    </Modal>
  );
}

export default CardDetailModal;
