// CardDetail/CardMetaInfo.jsx

import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function CardMetaInfo({ cardData, handlers, boardMembers }) {
  // Dữ liệu giả lập (thay thế bằng cardData thực tế khi triển khai)
  const mockLabels = [
    { text: "xyynijknkj", color: "#2e7d32" },
    { text: "abc", color: "#1565c0", border: true },
  ];
  const mockDueDate = {
    date: "Dec 15, 11:36 AM",
    status: "Due soon",
    statusColor: "#fbc02d",
  };
  const assignedMembers = cardData?.assignees || [];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 4,
        flexWrap: "wrap",
        mt: 2,
      }}
    >
      {/* MEMBERS */}
      <Box sx={{ minWidth: 160 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontSize: 13 }}
        >
          Members
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "nowrap" }}>
          {assignedMembers.map((member, id) => (
            <Avatar
              key={id}
              sx={{
                // bgcolor: member.color,
                width: 32,
                height: 32,
                fontSize: 13,
              }}
            >
              {member?.user?.name
                ? member.user.name.substring(0, 2).toUpperCase()
                : "AN"}
            </Avatar>
          ))}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              // SỬA ĐỔI: Dùng màu nền background.paper (màu của modal)
              // Hoặc action.hover/action.selected nếu muốn màu nổi bật hơn
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.action.hover
                  : theme.palette.background.default,
              // Thay đổi màu nền:
              // Màu nền trắng/xám nhẹ trong Light mode, màu xám đậm trong Dark mode
              // background.default thường là màu tốt nhất để phân biệt với nền của Modal
              bgcolor: "background.default",
              color: "text.secondary", // Màu chữ/icon: dùng màu xám
              cursor: "pointer",
              border: (theme) => `1px solid ${theme.palette.divider}`, // Thêm viền nhẹ
            }}
            onClick={handlers.openMembers}
          >
            +
          </Avatar>
        </Box>
      </Box>

      {/* LABELS */}
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontSize: 13 }}
        >
          Labels
        </Typography>
        <Box
          sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap", rowGap: 1 }}
        >
          {mockLabels.map((label, index) => (
            <Box
              key={index}
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: label.color,
                color: "#fff",
                borderRadius: 1,
                fontSize: 13,
                fontWeight: 500,
                border: label.border ? "2px solid #fff" : "none",
              }}
            >
              {label.text}
            </Box>
          ))}
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: "action.hover",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={handlers.openLabels}
          >
            +
          </Box>
        </Box>
      </Box>

      {/* DUE DATE */}
      <Box sx={{ mt: 2, mb: 3, flexBasis: "100%" }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mt: 2, fontSize: 13 }}
        >
          Due date
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            px: 1.5,
            py: 0.5,
            bgcolor: "action.hover",
            borderRadius: 1,
            cursor: "pointer",
          }}
          onClick={handlers.openDate}
        >
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">{mockDueDate.date}</Typography>
          <Box
            sx={{
              px: 1,
              py: "2px",
              bgcolor: mockDueDate.statusColor,
              borderRadius: 0.5,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {mockDueDate.status}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CardMetaInfo;
