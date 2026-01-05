// CardDetail/CardDetailHeader.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

// Style cố định
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

function CardDetailHeader({
  cardData,
  onClose,
  onUpdateCardField,
  onDeleteCard,
}) {
  const [isCompleted, setIsCompleted] = useState(
    cardData?.isCompleted || false
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(cardData?.title || "");

  // Sync state khi cardData thay đổi
  useEffect(() => {
    setTitleInput(cardData?.title || "");
    setIsCompleted(cardData?.isCompleted || false);
  }, [cardData]);

  // --- Handlers ---

  const handleToggleCompleted = async (e) => {
    const newState = e.target.checked;
    setIsCompleted(newState);

    const success = await onUpdateCardField(
      "isCompleted",
      newState,
      `Card đã ${newState ? "hoàn thành" : "đã được mở lại"}!`
    );

    if (!success) {
      setIsCompleted(!newState); // Rollback nếu thất bại
    }
  };

  const handleSaveTitle = async () => {
    const newTitle = titleInput.trim();

    if (newTitle !== cardData.title && newTitle !== "") {
      const success = await onUpdateCardField(
        "title",
        newTitle,
        "Đổi tên thẻ thành công!"
      );

      if (!success) {
        setTitleInput(cardData.title); // Rollback
      }
    } else if (newTitle === "") {
      setTitleInput(cardData.title); // Ngăn không cho để trống
    }

    setIsEditingTitle(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    }
  };

  // --- Menu Xóa Card ---
  const [anchorElCard, setAnchorElCard] = useState(null);
  const menuOpenCard = Boolean(anchorElCard);

  const handleOpenMenuCard = (event) => {
    event.stopPropagation();
    setAnchorElCard(event.currentTarget);
  };

  const handleCloseMenuCard = () => {
    setAnchorElCard(null);
  };

  const handleDeleteCard = () => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa vĩnh viễn thẻ "${cardData?.title}" không?`
    );

    if (!isConfirmed) return;

    onDeleteCard(cardData);
    handleCloseMenuCard();
  };

  return (
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
        <MoreHorizIcon fontSize="small" onClick={handleOpenMenuCard} />
      </IconButton>
      <IconButton onClick={onClose} sx={{ p: 0.5 }}>
        <CloseIcon />
      </IconButton>
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
    </Box>
  );
}

export default CardDetailHeader;
