// CardDetail/CardAttachments.jsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
// Import API xóa file nếu đã triển khai
// import { deleteAttachmentAPI } from "~/apis/cardApi";
import { socket } from "~/socket";

function CardAttachments({
  cardData,
  setCardData,
  onOpenAttachFile,
  API_ROOT,
  boardId,
}) {
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
      toast.success("Download bắt đầu...");
    } catch (error) {
      toast.error("Download thất bại");
    } finally {
      handleCloseMenu();
    }
  };

  // Delete (Gắn API thực tế sau)
  const handleDelete = async () => {
    if (!selectedAtt) return;

    try {
      // await deleteAttachmentAPI(selectedAtt._id); // API thực tế
      toast.warn("Tính năng đang phát triển - Xóa giả lập");

      // Cập nhật state (Immutable Update)
      setCardData((prevCard) => ({
        ...prevCard,
        attachments: prevCard.attachments.filter(
          (att) => att._id !== selectedAtt._id
        ),
      }));

      toast.success("Xóa file thành công");
      socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
    } catch (err) {
      toast.error("Lỗi xóa file");
    } finally {
      handleCloseMenu();
    }
  };

  return (
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
        <Button size="small" variant="outlined" onClick={onOpenAttachFile}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
                  flexShrink: 0,
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
              <IconButton size="small" onClick={(e) => handleOpenMenu(e, att)}>
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
  );
}

export default CardAttachments;
