// CardDetail/ChecklistBlock.jsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Checkbox,
  TextField,
} from "@mui/material";
import CheckListIcon from "@mui/icons-material/Checklist";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import {
  deleteChecklistAPI,
  createChecklistItemAPI,
  updateChecklistItemAPI,
  deleteChecklistItemAPI,
} from "~/apis/cardApi";
import { socket } from "~/socket";

function ChecklistBlock({
  checklist,
  cardData,
  setCardData,
  requestCardDataUpdate,
  boardId,
}) {
  const [newItemContent, setNewItemContent] = useState("");
  const [checklistIdOpenForm, setChecklistIdOpenForm] = useState(null);
  const [hideChecked, setHideChecked] = useState(false);

  // --- Tính toán Progress ---
  const totalItems = checklist.items?.length || 0;
  const completedItems =
    checklist.items?.filter((i) => i.isCompleted)?.length || 0;
  const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  const visibleItems = hideChecked
    ? checklist.items?.filter((item) => !item.isCompleted)
    : checklist.items;

  // --- Handlers ---

  const handleDeleteChecklist = async () => {
    try {
      await deleteChecklistAPI(checklist.id);

      // Cập nhật dữ liệu Local (Immutable Update)
      setCardData((prevCard) => ({
        ...prevCard,
        checklists: prevCard.checklists.filter((c) => c.id !== checklist.id),
      }));

      // Bắn socket
      socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
    } catch (error) {
      console.error("Delete checklist error:", error);
      toast.error("Lỗi xóa checklist");
    }
  };

  const handleAddItemSubmit = async (checklistId) => {
    if (!newItemContent.trim()) return;

    try {
      const content = newItemContent.trim();
      const newItem = await createChecklistItemAPI(checklistId, content);
      console.log("New checklist item:", newItem);
      // Cập nhật state
      setCardData((prevCard) => ({
        ...prevCard,
        checklists: prevCard.checklists.map((list) =>
          list.id === checklistId
            ? { ...list, items: [...(list.items || []), newItem] }
            : list
        ),
      }));

      setNewItemContent("");
      setChecklistIdOpenForm(null); // Đóng form sau khi thêm thành công

      socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
    } catch (error) {
      console.error("Add checklist item error:", error);
      toast.error("Lỗi thêm việc");
    }
  };

  const handleToggleItem = async (itemId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI (Cập nhật trực tiếp trên state)
    setCardData((prevCard) => ({
      ...prevCard,
      checklists: prevCard.checklists.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, isCompleted: newStatus } : item
        ),
      })),
    }));

    try {
      await updateChecklistItemAPI(itemId, { isCompleted: newStatus });
      socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
      // Rollback nếu thất bại (dùng requestCardDataUpdate để lấy lại data cũ)
      requestCardDataUpdate();
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Optimistic UI (Immutable Update)
    setCardData((prevCard) => ({
      ...prevCard,
      checklists: prevCard.checklists.map((list) => ({
        ...list,
        items: list.items.filter((item) => item.id !== itemId),
      })),
    }));

    try {
      await deleteChecklistItemAPI(itemId);
      socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
    } catch (error) {
      toast.error("Lỗi xóa việc");
      requestCardDataUpdate(); // Rollback nếu thất bại
    }
  };

  return (
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
          <Typography variant="h6">{checklist.title}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Nút Hide checked items */}
          <Button
            size="small"
            variant="text"
            sx={{ textTransform: "none" }}
            onClick={() => setHideChecked((prev) => !prev)}
          >
            {hideChecked ? "Show checked items" : "Hide checked items"}
          </Button>

          {/* Nút Delete */}
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={handleDeleteChecklist}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ width: 40 }}>
          {Math.round(progress)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
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

      {/* List Items */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {visibleItems?.map((item) => (
          <Box
            key={item.id}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Checkbox
              checked={item.isCompleted}
              onChange={() => handleToggleItem(item.id, item.isCompleted)}
              sx={{ p: 0.5 }}
            />
            <TextField
              fullWidth
              variant="standard"
              value={item.content}
              InputProps={{
                disableUnderline: true,
                readOnly: true,
              }}
              sx={{
                textDecoration: item.isCompleted ? "line-through" : "none",
                color: item.isCompleted ? "text.secondary" : "text.primary",
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

      {/* Add New Item Button/Form */}
      <Box sx={{ pl: 4 }}>
        {checklistIdOpenForm !== checklist.id ? (
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
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              autoFocus
              multiline
              minRows={2}
              placeholder="Add an item..."
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleAddItemSubmit(checklist.id)}
                disabled={!newItemContent.trim()}
                sx={{ textTransform: "none", fontWeight: 500, px: 2 }}
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
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ChecklistBlock;
