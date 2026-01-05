import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  createChecklistAPI,
  deleteChecklistAPI,
  createChecklistItemAPI,
  updateChecklistItemAPI,
  deleteChecklistItemAPI,
} from "~/apis/cardApi";
import { socket } from "~/socket";
import { toast } from "react-toastify";
const ADD_CHECKLIST_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400, // Kích thước cố định cho modal nhỏ
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

function AddChecklistModal({ open, onClose, card }) {
  const [title, setTitle] = useState("");
  const [copyFrom, setCopyFrom] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);

  const handleAddChecklist = async () => {
    try {
      const finalTitle = title.trim() === "" ? "Việc cần làm" : title.trim();

      // 1. Gọi API tạo mới
      const newChecklist = await createChecklistAPI(card._id, finalTitle);
      toast.success("Tạo checklist thành công");
      // 2. Cập nhật dữ liệu Local cho User A thấy ngay
      if (!card.checklists) card.checklists = [];
      card.checklists.push({ ...newChecklist, items: [] });

      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate((prev) => !prev);
      onClose();

      // 3. Bắn socket cho User B
      socket.emit("FE_UPDATE_BOARD", { boardId: card.boardId });
    } catch (error) {
      console.error("Create checklist error:", error);
      console.error("Response:", error?.response);
      toast.error(error?.response?.data?.message || "Lỗi tạo checklist");
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-checklist-title">
      <Box sx={ADD_CHECKLIST_STYLE}>
        {/* Header và nút đóng */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
            pb: 1,
            mb: 2,
          }}
        >
          <Typography id="add-checklist-title" variant="h6" component="h2">
            Add checklist
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 1. Tiêu đề */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
          Title
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={title}
          placeholder="Checklist"
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* 2. Nút Thêm */}
        <Button
          variant="contained"
          onClick={handleAddChecklist}
          sx={{
            bgcolor: (theme) => theme.palette.primary.main, // Màu xanh dương
            "&:hover": {
              bgcolor: (theme) => theme.palette.primary.dark,
            },
          }}
        >
          Add
        </Button>
      </Box>
    </Modal>
  );
}

export default AddChecklistModal;
