import React, { useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const MANAGE_MEMBER_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  // width: '80%',
  // maxWidth: 400,
  width: "auto",
  minWidth: 300,
  maxWidth: 350,

  height: "auto",
  maxHeight: "80vh",

  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  // Ví dụ: Trên màn hình nhỏ hơn 600px, giảm padding
  "@media (max-width: 600px)": {
    p: 1.5,
  },
};

// Dữ liệu giả lập thành viên của Board
const BOARD_MEMBERS = [
  { id: "m1", initials: "QN", name: "Quoc Nguyen", color: "#00bcd4" },
  { id: "m2", initials: "DN", name: "Duy Quang Nguyen", color: "#2196f3" },
  { id: "m3", initials: "KA", name: "Khong Duc Quang A3K23", color: "#ff9800" },
  { id: "m4", initials: "QM", name: "Quang Phan Minh", color: "#673ab7" },
  // ... thêm thành viên khác
];

function ManageMembersModal({ open, onClose, cardId }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách thành viên dựa trên từ khóa tìm kiếm
  const filteredMembers = useMemo(() => {
    if (!searchTerm) {
      return BOARD_MEMBERS;
    }
    const lowercasedSearch = searchTerm.toLowerCase();
    return BOARD_MEMBERS.filter((member) =>
      member.name.toLowerCase().includes(lowercasedSearch)
    );
  }, [searchTerm]);

  const handleToggleMember = (memberId) => {
    // Thêm logic API để gán/hủy gán thành viên cho Card (cardId)
    console.log(`Đang toggle thành viên ${memberId} cho Card ${cardId}`);
    // Sau khi gọi API thành công, bạn sẽ cập nhật UI
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="manage-members-title">
      <Box sx={MANAGE_MEMBER_STYLE}>
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
          <Typography id="manage-members-title" variant="h6" component="h2">
            Member
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 1. Ô tìm kiếm */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search for members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* 2. Danh sách thành viên */}
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          Board members
        </Typography>

        <List sx={{ overflowY: "auto", flexGrow: 1, p: 0 }}>
          {filteredMembers.map((member) => (
            <ListItem
              key={member.id}
              button
              onClick={() => handleToggleMember(member.id)}
              sx={{
                // Thêm style hover và active nếu cần
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: member.color,
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  {member.initials}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                // Thêm SecondaryText nếu muốn hiển thị username/email
              />
            </ListItem>
          ))}
          {filteredMembers.length === 0 && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ ml: 2, mt: 1 }}
            >
              No results found
            </Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
}

export default ManageMembersModal;
