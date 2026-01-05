import React, { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  // Thêm các icon cần thiết
  Popper,
  ClickAwayListener,
  Paper,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TagIcon from "@mui/icons-material/Tag";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

// Data mẫu cho Labels (Giữ nguyên)
const dummyLabels = [
  { id: 1, name: "xyynijnkj", color: "#1E8449" },
  { id: 2, name: "Tài liệu", color: "#B8860B" },
  { id: 3, name: "Bug", color: "#CC5500" },
  { id: 4, name: "Tính năng mới", color: "#007FFF" },
  { id: 5, name: "Khẩn cấp", color: "#DC143C" },
  { id: 6, name: "Bình thường", color: "#DC987C" },
  { id: 7, name: "Máy tính", color: "#2E143C" },
];

const FilterContent = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  // --- State mới cho Popover Labels và selection ---
  const [labelAnchorEl, setLabelAnchorEl] = useState(null);
  const openLabelPopover = Boolean(labelAnchorEl);

  // State giả lập cho việc chọn Labels
  // Khởi tạo một số nhãn được chọn sẵn để minh họa
  const [selectedLabels, setSelectedLabels] = useState([1, 3]);

  const handleOpenLabelPopover = (event) => {
    // Lưu phần tử được click làm điểm neo
    setLabelAnchorEl(event.currentTarget);
  };

  const handleCloseLabelPopover = () => {
    setLabelAnchorEl(null);
  };
  const openLabelPopper = Boolean(labelAnchorEl);

  const handleLabelToggle = (labelId) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

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

  // --- 1. Card Status (Giữ nguyên) ---
  const cardStatusContent = (
    <Box>
      <FormControlLabel
        sx={{
          width: "100%",
          m: 0,
        }}
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="primary" />}
          />
        }
        label="Marked as complete"
      />
      <FormControlLabel
        sx={{
          width: "100%",
          m: 0,
        }}
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

  // --- 2. Due Date (Giữ nguyên) ---
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
          sx={{
            width: "100%",
            m: 0,
          }}
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

  // --- 3. Lọc theo Nhãn (Labels) (ĐÃ CẬP NHẬT) ---
  const labelsContent = (
    <Box>
      {/* 3.1. "No labels" checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<CheckBoxIcon color="primary" />}
          />
        }
        label="No labels"
        sx={{
          width: "100%",
          m: 0,
          display: "flex",
          alignItems: "center",
        }}
      />

      {/* 3.2. Hiển thị các nhãn đã chọn (Giữ nguyên logic gốc) */}
      {dummyLabels
        .filter((label) => selectedLabels.includes(label.id))
        .map((label) => (
          <FormControlLabel
            key={`selected-label-${label.id}`}
            control={
              <Checkbox
                checked={true} // Giả định là đã chọn
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
                  fontSize: "0.85rem",
                }}
              >
                {label.name}
              </Box>
            }
            sx={{
              width: "100%",
              m: 0,
              display: "flex",
              alignItems: "center",
              "& .MuiFormControlLabel-label": { flexGrow: 1 },
            }}
          />
        ))}

      {/* 3.3. Nút select labels mở Popover Labels */}
      <Box
        onClick={handleOpenLabelPopover} // 👈 Gắn sự kiện mở Popover
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "4px",

          // fontWeight: "bold",
          fontSize: "0.85rem",
          cursor: "pointer",
          m: "8px 0 24px 4px",
          p: 1,
          pr: 0,
          bgcolor: openLabelPopover ? "action.selected" : "transparent",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        Select labels
        <ExpandMoreIcon fontSize="small" />
      </Box>

      {/* 3.4. Popover / Menu cho Labels */}
      <Popper
        open={openLabelPopper}
        anchorEl={labelAnchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8], // cách Select labels 8px
            },
          },
          {
            name: "preventOverflow",
            options: {
              boundary: "clippingParents",
            },
          },
        ]}
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleCloseLabelPopover}>
          <Paper
            elevation={6}
            sx={{
              width: 300,
              borderRadius: 2,
              maxHeight: 350,
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Labels
              </Typography>
              <IconButton size="small" onClick={handleCloseLabelPopover}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* BODY */}
            <Box sx={{ maxHeight: 280, overflowY: "auto", p: 1 }}>
              {dummyLabels.map((label) => (
                <FormControlLabel
                  key={label.id}
                  control={
                    <Checkbox
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => handleLabelToggle(label.id)}
                      size="small"
                      sx={{ ml: 0, pl: 0 }}
                    />
                  }
                  label={
                    <Box
                      sx={{
                        width: "100%",
                        bgcolor: label.color,
                        color: "white",
                        borderRadius: "6px",
                        px: 1,
                        py: 0.8,
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                      }}
                    >
                      {label.name}
                    </Box>
                  }
                  sx={{
                    width: "100%",
                    m: 0,
                    my: 0.5,
                    "& .MuiFormControlLabel-label": {
                      flexGrow: 1,
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "50",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      sx={{ mt: 5 }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        },
      }}
    >
      {/*... Phần Modal/Filter Popover chính (Giữ nguyên) ...*/}
      <Box
        // Đặt styles của modal vào Box nội dung Popover
        sx={{
          width: "400px",
          height: "85vh",
          pb: 6,
          borderRadius: "8px",
          maxHeight: "90vh",
        }}
      >
        {/* Header Popover */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ width: 24, height: 24 }} />

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Filter
          </Typography>

          {/* Nút đóng */}
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* Vùng cuộn */}
        <Box
          sx={{
            overflowY: "auto",
            maxHeight: "100%",
            mt: 1,
            p: 2,
          }}
        >
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: "0.8rem" }}
            >
              Search cards, members, labels, and more.
            </Typography>
          </Box>

          <Divider />

          {/* 1. Card Status */}
          {renderFilterSection("Card status", null, cardStatusContent)}

          {/* 2. Due Date */}
          {renderFilterSection("Due date", null, dueDateContent)}

          {/* 3. Labels */}
          {renderFilterSection("Labels", null, labelsContent)}
        </Box>
      </Box>
    </Popover>
  );
};

export default FilterContent;
