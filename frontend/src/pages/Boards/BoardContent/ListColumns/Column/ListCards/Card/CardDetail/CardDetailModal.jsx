// CardDetailModal.jsx
import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskAltIcon from "@mui/icons-material/TaskAlt"; // Ví dụ cho icon Check/Task
import Button from "@mui/material/Button";
import CheckListIcon from "@mui/icons-material/Checklist";
import LabelIcon from "@mui/icons-material/Label";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddChecklistModal from "./Modals/AddChecklistModal";
import ManageMembersModal from "./Modals/ManageMembersModal";
import AttachFileModal from "./Modals/AttachFileModal";
import ManageLabelsModal from "./Modals/ManageLabelsModal";
import ManageDateModal from "./Modals/ManageDateModal";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import SubjectIcon from "@mui/icons-material/Subject";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import Avatar from "@mui/material/Avatar"; // Cần import Avatar

// check box cho card title
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Thêm vào các imports hiện có của bạn
import { LinearProgress } from "@mui/material";

const style = {
  position: "absolute",
  top: 60, // cách top 24px (giống Trello)
  left: "50%",
  transform: "translateX(-50%)", // chỉ căn giữa ngang
  width: "90%", // Hoặc kích thước phù hợp
  maxWidth: 1100, // Chiều rộng tối đa
  height: "auto",
  minHeight: "50vh", // Chiều cao tối thiểu
  maxHeight: "80vh", // Chiều cao tối đa

  // Cấu hình Flexbox
  display: "flex",
  flexDirection: "column",
  gap: 2,
  borderRadius: "8px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4, // Padding mặc định

  // *** MEDIA QUERIES cho màn hình nhỏ (Mobile) ***
  "@media (max-width: 600px)": {
    // 1. Trên di động, Modal chiếm gần như toàn bộ màn hình
    width: "100%",
    height: "100%",
    maxHeight: "100vh", // Chiếm toàn bộ chiều cao
    borderRadius: 0, // Bỏ bo góc
    p: 2, // Giảm padding

    // 2. Thay đổi cách căn chỉnh nếu cần (thường Modal chiếm toàn bộ màn hình sẽ không cần transform)
    transform: "none",
    top: 0,
    left: 0,
  },

  // *** MEDIA QUERIES cho màn hình trung bình (Tablet) ***
  "@media (min-width: 601px) and (max-width: 960px)": {
    width: "95%",
    p: 3,
  },
  // Áp dụng style cho thanh cuộn bên trong nếu cần
};

function CardDetailModal({ open, onClose, card }) {
  // State 1: Quản lý trạng thái hoàn thành của card
  const [isCompleted, setIsCompleted] = React.useState(card.isCompleted);
  // State 1: Quản lý trạng thái sửa tiêu đề (true = đang sửa, false = đang xem)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);

  //Quản lý nội dung tiêu đề tạm thời đang được sửa
  const [titleInput, setTitleInput] = React.useState(card.title);

  // State quản lý nội dung mô tả đang được chỉnh sửa
  const [editingDescription, setEditingDescription] = React.useState(
    card.description || ""
  );

  // State kiểm tra xem người dùng có đang chỉnh sửa không
  const [isEditing, setIsEditing] = React.useState(false);

  // State quản lý nội dung Nhận xét đang được gõ
  const [commentText, setCommentText] = React.useState("");
  // State kiểm tra xem người dùng có đang gõ nhận xét không
  const [isCommenting, setIsCommenting] = React.useState(false);

  //State quản lý Modal Thêm Checklist
  const [openAddChecklist, setOpenAddChecklist] = React.useState(false);
  const handleOpenAddChecklist = () => setOpenAddChecklist(true);
  const handleCloseAddChecklist = () => setOpenAddChecklist(false);

  //State quản lý Modal Thêm Thành viên
  const [openManageMembers, setOpenManageMembers] = React.useState(false);
  const handleOpenManageMembers = () => setOpenManageMembers(true);
  const handleCloseManageMembers = () => setOpenManageMembers(false);

  //State quản lý Modal Đính kèm Tệp
  const [openAttachFile, setOpenAttachFile] = React.useState(false);
  const handleOpenAttachFile = () => setOpenAttachFile(true);
  const handleCloseAttachFile = () => setOpenAttachFile(false);

  // State quản lý Modal Nhãn
  const [openManageLabels, setOpenManageLabels] = React.useState(false);
  const handleOpenManageLabels = () => setOpenManageLabels(true);
  const handleCloseManageLabels = () => setOpenManageLabels(false);

  // State quản lý Modal Day
  const [openManageDate, setOpenManageDate] = React.useState(false);
  const handleOpenManageDate = () => setOpenManageDate(true);
  const handleCloseManageDate = () => setOpenManageDate(false);

  // Xử lý khi Checkbox thay đổi (Đánh dấu hoàn thành/chưa hoàn thành)
  const handleToggleCompleted = (e) => {
    const newState = e.target.checked;
    setIsCompleted(newState);

    // *** GỌI API CẬP NHẬT TRẠNG THÁI HOÀN THÀNH Ở ĐÂY ***
    console.log(
      `Cập nhật trạng thái hoàn thành cho card ${card._id}: ${
        newState ? "Đã hoàn thành" : "Chưa hoàn thành"
      }`
    );
  };
  // Xử lý Inline Edit Title
  const handleSaveTitle = (e) => {
    // Cắt bỏ khoảng trắng hai đầu
    const newTitle = titleInput.trim();

    if (newTitle !== card.title && newTitle !== "") {
      // *** GỌI API CẬP NHẬT TITLE Ở ĐÂY ***
      console.log(`Cập nhật Title mới cho card ${card._id}: ${newTitle}`);

      // Cập nhật lại title của card (Nếu bạn dùng Redux/Context, bạn sẽ dispatch action ở đây)
      // Ví dụ tạm thời: card.title = newTitle;
    } else if (newTitle === "") {
      // Ngăn không cho để trống
      setTitleInput(card.title);
    }

    // Thoát khỏi chế độ chỉnh sửa
    setIsEditingTitle(false);
  };

  // 2. Khi người dùng nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn xuống dòng
      handleSaveTitle();
    }
  };
  // Hàm gọi API Cập nhật Mô tả (Được gọi khi nhấn nút Lưu)
  const handleSaveDescription = () => {
    // Ngăn chặn gọi API nếu nội dung không thay đổi
    if (editingDescription === card.description) {
      setIsEditing(false);
      return;
    }

    // *** LOGIC GỌI API ĐỂ CẬP NHẬT MÔ TẢ ***

    console.log(
      `Đang cập nhật mô tả cho Card ${card._id} thành: ${editingDescription}`
    );

    // Ví dụ: Giả lập API thành công
    setTimeout(() => {
      console.log("Cập nhật mô tả thành công (Giả lập)!");
      // Sau khi API thành công, bạn cần cập nhật state global (Redux/Context)
      // Tạm thời, ta chỉ reset trạng thái chỉnh sửa
      setIsEditing(false);
      // Lưu ý: Trong thực tế, bạn sẽ cần đồng bộ hóa `card.description` với giá trị mới.
    }, 1000);

    // **********************************************
  };

  // Hàm Hủy bỏ chỉnh sửa
  const handleCancelEdit = () => {
    // Đặt lại nội dung về giá trị ban đầu của thẻ
    setEditingDescription(card.description || "");
    // Tắt chế độ chỉnh sửa
    setIsEditing(false);
  };

  // Hàm kích hoạt chế độ chỉnh sửa khi focus vào TextField
  const handleFocusDescription = () => {
    setIsEditing(true);
  };

  // Phần comments
  // Dữ liệu giả lập người dùng hiện tại (thường lấy từ Context/Redux)
  const currentUser = {
    name: "Quang Phan Minh",
    initials: "QM",
    avatarColor: "#5c6bc0",
  };

  // Hàm xử lý Đăng nhận xét (Gọi API)
  const handlePostComment = () => {
    if (!commentText.trim()) return;

    // *** LOGIC GỌI API ĐỂ THÊM NHẬN XÉT MỚI ***

    console.log(`Đang đăng nhận xét cho Card ${card._id}: "${commentText}"`);

    // Ví dụ: Giả lập API thành công
    setTimeout(() => {
      console.log("Đăng nhận xét thành công (Giả lập)!");

      // Sau khi API thành công:
      setCommentText(""); // Xóa nội dung
      setIsCommenting(false); // Ẩn các nút hành động
      // Cần Dispatch Action để cập nhật danh sách nhận xét (nếu có)
    }, 1000);

    // **********************************************
  };

  // Hàm Hủy bỏ nhận xét
  const handleCancelComment = () => {
    setCommentText(""); // Xóa nội dung
    setIsCommenting(false); // Ẩn các nút hành động
  };

  // *** Các style chung cho Typography và TextField ***
  // Style chung cho Typography và TextField
  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    // 🚨 Điều chỉnh Line Height để khớp với TextField mặc định
    lineHeight: "1.6", // Giá trị này thường ổn định hơn cho TextField
  };

  // Style cho vùng input/display để mô phỏng padding/margin
  const wrapperPadding = {
    // 🚨 Giảm padding/margin nếu cần thiết, hoặc điều chỉnh cho chính xác
    py: "0px",
    px: "0px",
    mx: "0px",
    my: "0px",
    borderRadius: "4px",
  };
  if (!card) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="card-detail-title"
      aria-describedby="card-detail-description"
    >
      <Box sx={style}>
        {/* 1. Phần Header/Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center", // ⬅ đảm bảo mọi thứ thẳng hàng dọc
            gap: 1,
          }}
        >
          {/* Checkbox */}
          <Checkbox
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon color="success" />}
            checked={isCompleted}
            onChange={handleToggleCompleted}
            size="medium"
            sx={{ p: 0 }}
          />

          {/* TextField hoặc Typography */}
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
              // caret cuối dòng
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
              {card.title}
            </Typography>
          )}

          {/* Nút Close */}
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* ===== MAIN CONTENT ===== */}
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
          {/* CỘT TRÁI */}
          <Box
            sx={{
              flex: 2,
              minWidth: 0,
              overflowY: "auto",
              paddingRight: 1,
              pb: 4,
            }}
          >
            {/* Description, checklist, activity khác */}
            {/* 2. Các nút chức năng (Thêm, Nhãn, Ngày,...) */}
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
              {/* ... Các nút khác ... */}
            </Box>
            {/* ===== META INFO (Members / Labels / Due date) ===== */}
            {/* ===== MEMBERS + LABELS ROW ===== */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                flexWrap: "wrap", // ⭐ tự xuống dòng khi không đủ chỗ
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
                    flexWrap: "wrap", // ⭐ labels xuống dòng
                    rowGap: 1,
                  }}
                >
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
                      border: "2px solid #fff", // giống label đang focus
                    }}
                  >
                    abc
                  </Box>
                  <Box
                    sx={{
                      width: 32,
                      height: 24,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* ===== DUE DATE===== */}
            <Box sx={{ mt: 2, mb: 3 }}>
              {/* Due date */}
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2, fontSize: 13 }}
              >
                Due date
              </Typography>
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

            {/* 3. Phần mô tả */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="More detailed description..."
                // Gán giá trị từ state tạm thời
                value={editingDescription}
                // Cập nhật state tạm thời ngay khi người dùng gõ
                onChange={(e) => setEditingDescription(e.target.value)}
                // Kích hoạt chế độ chỉnh sửa khi focus
                onFocus={handleFocusDescription}
                // Không dùng onBlur để lưu nữa
              />

              {/* Hiển thị nút Lưu/Hủy khi đang chỉnh sửa */}
              {isEditing && (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveDescription}
                    // Vô hiệu hóa nếu nội dung trống hoặc chưa thay đổi
                    disabled={
                      !editingDescription.trim() ||
                      editingDescription === card.description
                    }
                  >
                    Save
                  </Button>
                  <Button variant="text" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            {/* ===== CHECKLISTS (Phần mới thêm) ===== */}
            <Box sx={{ mt: 4 }}>
              {/* ---------------------------------------------------- */}
              {/* CHECKLIST 1: Ví dụ: Việc cần làm */}
              {/* ---------------------------------------------------- */}
              <Box sx={{ mb: 3 }}>
                {/* Header Checklist */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckListIcon fontSize="small" /> {/* Icon Checklist */}
                    <Typography variant="h6">Việc cần làm</Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* Nút Hide checked items */}
                    <Button
                      size="small"
                      variant="text"
                      sx={{ textTransform: "none" }}
                    >
                      Hide checked items
                    </Button>
                    {/* Nút Delete */}
                    <Button size="small" variant="text" color="error">
                      Delete
                    </Button>
                  </Box>
                </Box>

                {/* Progress Bar */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography variant="body2" sx={{ width: 40 }}>
                    50%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={50} // Giá trị tính theo %
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

                {/* Checklist Items */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    pl: 1,
                  }}
                >
                  {/* Item 1 (Đã checked) */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox size="small" defaultChecked />
                    <Typography
                      sx={{
                        textDecoration: "line-through",
                        color: "text.secondary",
                        flexGrow: 1,
                      }}
                    >
                      1
                    </Typography>
                  </Box>
                  {/* Item 2 (Chưa checked) */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox size="small" />
                    <Typography sx={{ flexGrow: 1 }}>2</Typography>
                  </Box>
                </Box>

                {/* Nút Add an item */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    bgcolor: "action.hover",
                    color: "text.primary",
                  }}
                >
                  Add an item
                </Button>
              </Box>

              {/* ---------------------------------------------------- */}
              {/* CHECKLIST 2: Ví dụ: Checklist1 (Chưa có item nào) */}
              {/* ---------------------------------------------------- */}
              <Box sx={{ mb: 3 }}>
                {/* Header Checklist */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckListIcon fontSize="small" />
                    <Typography variant="h6">Checklist1</Typography>
                  </Box>

                  <Button size="small" variant="text" color="error">
                    Delete
                  </Button>
                </Box>

                {/* Progress Bar */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography variant="body2" sx={{ width: 40 }}>
                    0%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: (theme) => theme.palette.action.hover,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#5BA4CF",
                      },
                    }}
                  />
                </Box>

                {/* Nút Add an item */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    bgcolor: "action.hover",
                    color: "text.primary",
                  }}
                >
                  Add an item
                </Button>
              </Box>
            </Box>
            {/* ===== ATTACHMENTS ===== */}
            <Box sx={{ mt: 4 }}>
              {/* Header */}
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

                <Button size="small" variant="outlined">
                  Add
                </Button>
              </Box>

              {/* Files */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* File item */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  {/* File type */}
                  <Box
                    sx={{
                      width: 48,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    JSON
                  </Box>

                  {/* File info */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>My workflow.json</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Added just now
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <IconButton size="small">
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* File item */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "text.secondary",
                    }}
                  >
                    JS
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>mock-data.js</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Added just now
                    </Typography>
                  </Box>

                  <IconButton size="small">
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* END CỘT TRÁI */}

          {/* CỘT PHẢI */}
          <Box sx={{ flex: 1, minWidth: 280, overflowY: "auto", p: 1 }}>
            {/* Comments */}
            {/* 4. Phần Nhận xét */}
            <Box sx={{ mt: 2, mb: 4 }}>
              <Typography variant="h6">Comments</Typography>

              {/* Khung nhập Nhận xét */}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {/* Avatar người dùng hiện tại */}
                <Avatar
                  sx={{
                    bgcolor: currentUser.avatarColor,
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  {currentUser.initials}
                </Avatar>

                {/* Vùng nhập liệu */}
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={isCommenting ? 3 : 1} // Tăng chiều cao khi focus
                    placeholder="Write a comment..."
                    variant="outlined" // Dùng variant="outlined" cho comment
                    size="small"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    // Kích hoạt chế độ chỉnh sửa khi focus
                    onFocus={() => setIsCommenting(true)}
                    sx={{
                      transition: "rows 0.3s",
                      // Tạo khoảng cách nếu không có Avatar
                      ml: { xs: 0, sm: 0 },
                    }}
                  />

                  {/* Nút Đăng/Hủy (Chỉ hiển thị khi đang gõ) */}
                  {isCommenting && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handlePostComment}
                        disabled={!commentText.trim()} // Vô hiệu hóa nếu nội dung trống
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
              {/* Danh sách các nhận xét hiện có sẽ được đặt ở đây */}
              {/* ... (Ví dụ: List hoặc các Box cho từng comment) ... */}

              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
              {/* Ví dụ về một Comment đã có (Dựa theo hình ảnh) */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#7e57c2",
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  QM
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Quang Phan Minh
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 1 }}
                    >
                      09:09 23 thg 10, 2025
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    đã thêm thẻ này vào danh sách Đang làm.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>{" "}
        {/* END MAIN CONTENT */}
        {/* Hiển thị Modal Thêm Checklist */}
        <AddChecklistModal
          open={openAddChecklist}
          onClose={handleCloseAddChecklist}
          cardId={card._id} // Truyền cardId để xử lý API
        />
        {/* Hiển thị model thêm thành viên */}
        <ManageMembersModal
          open={openManageMembers}
          onClose={handleCloseManageMembers}
          cardId={card._id} // Truyền cardId
        />
        {/* Hiển thị modal đính kèm tệp */}
        <AttachFileModal
          open={openAttachFile}
          onClose={handleCloseAttachFile}
          cardId={card._id} // Truyền cardId
        />
        {/* Hiển thị modal label */}
        <ManageLabelsModal
          open={openManageLabels}
          onClose={handleCloseManageLabels}
          cardId={card._id} // Truyền cardId
        />
        {/* Hiển thị modal Quản lý Ngày */}
        <ManageDateModal
          open={openManageDate}
          onClose={handleCloseManageDate}
          cardId={card._id} // Truyền cardId
          card={card}
        />
        {/* thêm thanh cuộn riêng cho nội dung bên trong nếu cần */}
      </Box>
    </Modal>
  );
}

export default CardDetailModal;
