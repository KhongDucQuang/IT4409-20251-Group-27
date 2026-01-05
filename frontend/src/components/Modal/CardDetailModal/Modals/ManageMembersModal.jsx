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
  ListItemButton, // Đã tách ListItemButton
  Checkbox,
} from "@mui/material";

import { assignMemberAPI, unassignMemberAPI } from "~/apis/cardApi";
import { toast } from "react-toastify";
import { socket } from "~/socket";
import CloseIcon from "@mui/icons-material/Close";

const MANAGE_MEMBER_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

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
  "@media (max-width: 600px)": {
    p: 1.5,
  },
};

// Dữ liệu giả lập BOARD_MEMBERS đã được loại bỏ

function ManageMembersModal({ open, onClose, card, boardMembers }) {
  const [searchTerm, setSearchTerm] = useState("");
  // State để force component re-render khi card.assignees bị thay đổi (do sửa prop trực tiếp)
  const [assigneeUpdate, setAssigneeUpdate] = useState(0);

  // Lọc danh sách thành viên dựa trên từ khóa tìm kiếm
  const filteredMembers = useMemo(() => {
    if (!boardMembers || boardMembers.length === 0) {
      return [];
    }

    if (!searchTerm) {
      return boardMembers;
    }

    const lowercasedSearch = searchTerm.toLowerCase();

    // SỬA LỖI 1: Bảo vệ việc truy cập member.user.name
    return boardMembers.filter((member) => {
      // Dùng Optional Chaining và OR để tránh lỗi "Cannot read properties of undefined (reading 'toLowerCase')"
      const userName = member.user?.name || "";
      return userName.toLowerCase().includes(lowercasedSearch);
    });
    // Thêm boardMembers vào dependency array để đảm bảo cập nhật khi danh sách thay đổi
  }, [searchTerm, boardMembers]);

  const handleToggleMember = async (userId) => {
    try {
      // ⚠️ Lưu ý: Việc thay đổi trực tiếp prop 'card' là anti-pattern.
      // Giải pháp tốt hơn là sử dụng state hook (e.g., useCardDetails hook)
      // hoặc truyền hàm update card từ component cha.

      const isAssigned = card.assignees?.some((a) => a.userId === userId);
      let success = false;

      if (isAssigned) {
        // Hủy gán
        await unassignMemberAPI(card._id, userId);
        card.assignees = card.assignees.filter((a) => a.userId !== userId);
        toast.info("Đã hủy gán thành viên");
        success = true;
      } else {
        // Gán thành viên
        await assignMemberAPI(card._id, userId);

        const userToAdd = boardMembers.find((m) => m.user.id === userId)?.user;
        if (userToAdd) {
          if (!card.assignees) card.assignees = [];
          // Thêm người được gán vào mảng assignees
          card.assignees.push({ userId: userToAdd.id, user: userToAdd });
        }
        toast.success("Đã gán thành viên thành công");
        success = true;

        // ✅ Socket 2: Thông báo riêng
        socket.emit("FE_SEND_NOTIFICATION", {
          recipientId: userId,
          boardId: card.boardId,
        });
      }

      if (success) {
        // ✅ Socket 1: Update board (cập nhật UI cho mọi người)
        socket.emit("FE_UPDATE_BOARD", { boardId: card.boardId });

        // SỬA LỖI 3: Force re-render để cập nhật checkbox
        setAssigneeUpdate((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Lỗi cập nhật thành viên");
    }
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
            Assign Member
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

        <List dense sx={{ maxHeight: 300, overflowY: "auto" }}>
          {/* SỬA LỖI 2: Dùng filteredMembers thay vì boardMembers để hiển thị danh sách đã lọc */}
          {filteredMembers?.map((member) => {
            // Kiểm tra member.user để tránh lỗi rendering
            if (!member || !member.user) return null;

            const isAssigned = card.assignees?.some(
              (a) => a.userId === member.user.id
            );
            return (
              <ListItem
                // Dùng member.user.id làm key
                key={member.user.id}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleToggleMember(member.user.id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={member.user.name}
                      src={member.user.avatarUrl}
                      sx={{ width: 28, height: 28 }}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={member.user.name} />
                  <Checkbox edge="end" checked={!!isAssigned} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Modal>
  );
}

export default ManageMembersModal;
