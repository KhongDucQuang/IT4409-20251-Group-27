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

function AddChecklistModal({ open, onClose, cardId }) {
  const [title, setTitle] = useState("");
  const [copyFrom, setCopyFrom] = useState("");

  const handleAddChecklist = () => {
    // 1. Thêm logic gọi API để tạo Checklist mới
    const finalTitle = title.trim() === "" ? "Việc cần làm" : title.trim();
    console.log(
      `Đang tạo Checklist cho Card ${cardId} với Tiêu đề: ${title}, Sao chép từ: ${
        copyFrom || "(không có)"
      }`
    );

    // 2. Sau khi API thành công, đóng modal
    onClose();

    // 3. (Tùy chọn) Reset state nếu cần
    setTitle("");
    setCopyFrom("");
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
          disabled={!title} // Vô hiệu hóa nếu tiêu đề trống
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
