// ManageLabelsModal.jsx

import React, { useState, useMemo } from "react";
import CreateLabelModal from "./CreateLabelModal";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

const MANAGE_LABEL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 350, // Chiều rộng tối đa nhỏ gọn
  height: "auto",
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
};

// Dữ liệu giả lập các Nhãn (Labels)
const ALL_LABELS = [
  { id: "l1", name: "xyynijkngj", color: "#117A65" },
  { id: "l2", name: "Bug Fix", color: "#A9881E" },
  { id: "l3", name: "Critical", color: "#C83A3A" },
  { id: "l4", name: "Design Review", color: "#8E44AD" },
  { id: "l5", name: "Feature", color: "#3A9AC8" },
  { id: "l6", name: "abc", color: "#1B619E" },
];

// Dữ liệu giả lập các nhãn hiện đang được gán cho thẻ (Card)
const CARD_LABELS_MOCK = ["l3", "l5"];

function ManageLabelsModal({ open, onClose, cardId }) {
  const [searchTerm, setSearchTerm] = useState("");
  // State để quản lý các nhãn được chọn
  const [checkedLabels, setCheckedLabels] = useState(CARD_LABELS_MOCK);
  // State mới: Quản lý Modal Tạo Nhãn
  const [openCreateLabel, setOpenCreateLabel] = useState(false);

  // Lọc danh sách nhãn dựa trên từ khóa tìm kiếm
  const filteredLabels = useMemo(() => {
    if (!searchTerm) return ALL_LABELS;
    const lowercasedSearch = searchTerm.toLowerCase();
    return ALL_LABELS.filter((label) =>
      label.name.toLowerCase().includes(lowercasedSearch)
    );
  }, [searchTerm]);

  // Xử lý khi click vào checkbox/label
  const handleToggleLabel = (labelId) => {
    const currentIndex = checkedLabels.indexOf(labelId);
    const newChecked = [...checkedLabels];

    if (currentIndex === -1) {
      newChecked.push(labelId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setCheckedLabels(newChecked);

    // Thêm logic API để gán/hủy gán nhãn cho Card (cardId)
    console.log(
      `Đang toggle nhãn ${labelId} cho Card ${cardId}. Nhãn mới: ${newChecked}`
    );
  };

  // 2. Hàm mở Modal Tạo Nhãn Mới
  const handleCreateLabels = () => {
    setOpenCreateLabel(true);
  };

  // 3. Hàm đóng Modal Tạo Nhãn Mới
  const handleCloseCreateLabel = () => {
    setOpenCreateLabel(false);
  };

  const handleEditLabel = (labelId) => {
    console.log(`Chỉnh sửa nhãn: ${labelId}`);
    // Mở Modal chỉnh sửa nhãn cụ thể
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="manage-labels-title">
      <Box sx={MANAGE_LABEL_STYLE}>
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
          <Typography id="manage-labels-title" variant="h6" component="h2">
            Labels
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 1. Ô tìm kiếm */}
        <TextField
          fullWidth
          size="small"
          placeholder="Find labels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* 2. Danh sách nhãn */}
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Labels
        </Typography>

        <List sx={{ overflowY: "auto", flexGrow: 1, p: 0 }}>
          {filteredLabels.map((label) => {
            const isChecked = checkedLabels.indexOf(label.id) !== -1;

            return (
              <ListItem
                key={label.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    size="small"
                    onClick={() => handleEditLabel(label.id)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  role={undefined}
                  onClick={() => handleToggleLabel(label.id)}
                  dense
                  sx={{
                    // Tăng khoảng cách để hiển thị nhãn màu
                    py: 0.5,
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    edge="start"
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{ p: 0, mr: 1 }}
                  />

                  {/* Thanh nhãn màu */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      bgcolor: label.color,
                      color: "white",
                      borderRadius: "4px",
                      py: 0.5,
                      px: 1,
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                      textAlign: "left",
                    }}
                  >
                    {label.name}
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
          {filteredLabels.length === 0 && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ ml: 2, mt: 1 }}
            >
              Not found any label matching "{searchTerm}"
            </Typography>
          )}
        </List>

        {/* 3. Nút tạo nhãn mới */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleCreateLabels}
          sx={{ mt: 2 }}
        >
          Create a new label
        </Button>
        {/* Render Modal Tạo Nhãn Mới */}
        <CreateLabelModal
          open={openCreateLabel}
          onClose={handleCloseCreateLabel}
          // Thêm props nếu cần (ví dụ: hàm refresh danh sách nhãn)
        />
      </Box>
    </Modal>
  );
}

export default ManageLabelsModal;
