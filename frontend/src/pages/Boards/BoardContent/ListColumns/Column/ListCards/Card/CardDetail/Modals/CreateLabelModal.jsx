// CreateLabelModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

const WRAPPER = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "92%",
  maxWidth: 360,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
};

const COLORS = [
  "#FF6F61",
  "#6B5B95",
  "#88B04B",
  "#F7CAC9",
  "#92A8D1",
  "#955251",
  "#B565A7",
  "#009B77",
  "#DD4124",
  "#D65076",
  "#45B8AC",
  "#EFC050",
  "#5B5EA6",
  "#9B2335",
  "#DFCFBE",
  "#55B4B0",
  "#E15D44",
  "#7FCDCD",
  "#BC243C",
  "#C3447A",
  "#98DDCA",
  "#FFD3B4",
  "#FFAAA7",
  "#D5ECC2",
  "#FFC1FA",
  "#A7C5EB",
  "#D9D7F1",
  "#FFABAB",
  "#FFDAAB",
  "#E2F0CB",
];

function CreateLabelModal({ open, onClose }) {
  const [labelName, setLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!labelName.trim()) return;

    console.log("Tạo nhãn:", labelName, selectedColor);
    onClose();
    setLabelName("");
    setSelectedColor(COLORS[0]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={WRAPPER}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <IconButton size="small" onClick={onClose}>
            <KeyboardBackspaceIcon />
          </IconButton>

          <Typography variant="h6" fontWeight="bold">
            Create label
          </Typography>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Màu đang chọn */}
        <Box
          sx={{
            height: 45,
            borderRadius: 1,
            bgcolor: selectedColor || "#333",
            border: selectedColor ? "none" : "2px dashed #777",
            mb: 3,
          }}
        />

        {/* Title */}
        <Typography fontWeight="bold" mb={1}>
          Title
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Color Grid (responsive) */}
        <Typography fontWeight="bold" mb={1}>
          Choose a color
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(55px, 1fr))",
            gap: 1.2,
            mb: 3,
          }}
        >
          {COLORS.map((c, i) => (
            <Box
              key={i}
              onClick={() => setSelectedColor(c)}
              sx={{
                bgcolor: c,
                height: 38,
                borderRadius: 1,
                cursor: "pointer",
                border:
                  selectedColor === c
                    ? "2px solid #1976d2"
                    : "1px solid transparent",
              }}
            />
          ))}
        </Box>

        {/* Remove color */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setSelectedColor(null)}
          disabled={!selectedColor}
          sx={{ mb: 1 }}
        >
          <CloseIcon sx={{ mr: 1 }} /> Remove color
        </Button>

        {/* Create */}
        <Button
          fullWidth
          variant="contained"
          disabled={!labelName.trim()}
          onClick={handleCreate}
        >
          Create new
        </Button>
      </Box>
    </Modal>
  );
}

export default CreateLabelModal;
