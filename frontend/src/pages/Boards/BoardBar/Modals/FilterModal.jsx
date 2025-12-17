import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TagIcon from "@mui/icons-material/Tag"; // Dùng cho Labels
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

// Style cơ bản cho Modal
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400, // Chiều rộng cố định cho Modal Filter
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  maxHeight: "90vh",
  overflowY: "auto",
  p: 3,
};

// Data mẫu cho Labels (Dựa trên ảnh filter.png)
const dummyLabels = [
  { id: 1, name: "xyynijnkj", color: "#1E8449" },
  { id: 2, name: "Tài liệu", color: "#B8860B" },
  { id: 3, name: "Bug", color: "#CC5500" },
];

const FilterModal = ({ open, onClose }) => {
  const renderFilterSection = (title, icon, content) => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {icon &&
          React.cloneElement(icon, { sx: { mr: 1, fontSize: "1.2rem" } })}
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      {content}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  // --- 1. Lọc theo Trạng thái Card ---
  const cardStatusContent = (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="primary" />}
          />
        }
        label="Marked as complete"
      />
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="primary" />}
          />
        }
        label="Not marked as complete"
      />
    </Box>
  );

  // --- 2. Lọc theo Ngày đến hạn (Due Date) ---
  const dueDateContent = (
    <Box>
      {[
        { label: "Overdue", icon: <AccessTimeIcon color="error" /> },
        {
          label: "Due in the next day",
          icon: <AccessTimeIcon color="warning" />,
        },
        {
          label: "Due in the next week",
          icon: <AccessTimeIcon color="primary" />,
        },
        {
          label: "Due in the next month",
          icon: <AccessTimeIcon color="success" />,
        },
      ].map((item) => (
        <FormControlLabel
          key={item.label}
          control={
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="primary" />}
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {React.cloneElement(item.icon, {
                sx: { mr: 1, fontSize: "1rem" },
              })}
              {item.label}
            </Box>
          }
        />
      ))}
    </Box>
  );

  // --- 3. Lọc theo Nhãn (Labels) ---
  const labelsContent = (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="primary" />}
          />
        }
        label="No labels"
      />
      {dummyLabels.map((label) => (
        <FormControlLabel
          key={label.id}
          control={
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon color="primary" />}
            />
          }
          label={
            <Box
              sx={{
                bgcolor: label.color,
                color: "white",
                borderRadius: "4px",
                px: 1,
                py: 0.5,
                fontWeight: "bold",
              }}
            >
              {label.name}
            </Box>
          }
          sx={{
            width: "100%",
            m: 0,
            "& .MuiFormControlLabel-label": { flexGrow: 1 },
          }}
        />
      ))}
      <Typography
        variant="body2"
        sx={{ mt: 1, cursor: "pointer", color: "primary.main" }}
      >
        Select labels
      </Typography>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header Modal */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Filter</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Phần Lọc theo Keyword */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Keyword
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter a keyword..."
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Search cards, members, labels, and more.
          </Typography>
        </Box>

        <Divider />

        {/* 1. Card Status */}
        {renderFilterSection("Card status", null, cardStatusContent)}

        {/* 2. Due Date */}
        {renderFilterSection("Due date", null, dueDateContent)}

        {/* 3. Labels */}
        {renderFilterSection("Labels", <TagIcon />, labelsContent)}
      </Box>
    </Modal>
  );
};

export default FilterModal;
