// CardDetail/CardDescription.jsx

import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

function CardDescription({ cardData, onUpdateCardField }) {
  const [editingDescription, setEditingDescription] = useState(
    cardData?.description || ""
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Đồng bộ trạng thái khi cardData thay đổi
  useEffect(() => {
    setEditingDescription(cardData?.description || "");
  }, [cardData]);

  const handleSaveDescription = async () => {
    const trimmedDescription = editingDescription.trim();
    if (trimmedDescription === cardData.description) {
      setIsEditingDescription(false);
      return;
    }

    const success = await onUpdateCardField(
      "description",
      trimmedDescription,
      "Cập nhật mô tả thành công!"
    );

    if (success) {
      setIsEditingDescription(false);
    }
  };

  const handleCancelEditDescription = () => {
    setEditingDescription(cardData.description || "");
    setIsEditingDescription(false);
  };

  // Hiển thị placeholder nếu không có mô tả
  const displayDescription =
    cardData?.description || "More detailed description...";

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Description
      </Typography>

      {/* --- KẾT XUẤT CÓ ĐIỀU KIỆN --- */}
      {isEditingDescription ? (
        // 1. CHẾ ĐỘ CHỈNH SỬA (EDITING MODE): Dùng TextField
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={8}
          placeholder="More detailed description..."
          value={editingDescription}
          onChange={(e) => setEditingDescription(e.target.value)}
          sx={{ mb: 1 }}
        />
      ) : (
        // 2. CHẾ ĐỘ CHỈ ĐỌC (READ-ONLY MODE): Dùng Box và Typography
        <Box
          // Click vào Box để chuyển sang chế độ chỉnh sửa
          onClick={() => setIsEditingDescription(true)}
          sx={{
            cursor: "pointer",
            fontStyle: "italic",
            backgroundColor: "#f0f0f0", // Màu nền nhẹ
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #e0e0e0", // Border mỏng

            // KIỂM SOÁT CHIỀU CAO VÀ CUỘN (Bạn có thể điều chỉnh maxHeight tại đây)
            maxHeight: "200px",
            overflowY: "auto",

            whiteSpace: "pre-wrap", // Giữ định dạng xuống dòng
          }}
        >
          <Typography variant="body1">{displayDescription}</Typography>
        </Box>
      )}

      {/* --- NÚT SAVE/CANCEL chỉ hiển thị khi đang chỉnh sửa --- */}
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
  );
}

export default CardDescription;
