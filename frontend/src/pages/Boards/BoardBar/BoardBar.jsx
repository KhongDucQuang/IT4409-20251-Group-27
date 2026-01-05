import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FilterListIcon from "@mui/icons-material/FilterList";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Tooltip, Button, Popover, TextField, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState } from "react";
import { inviteUserToBoardAPI } from "~/apis/boardApi";
import { toast } from "react-toastify";
import FilterContent from "./Modals/FilterContent.jsx";
const MENU_STYLES = {
  color: "white",
  bgcolor: "transparent",
  border: "none",
  paddingX: "5px",
  borderRadius: "4px",
  ".MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover": {
    bgcolor: "primary.50",
  },
};
function BoardBar({ board }) {
  // State xử lý Invite
  const [anchorElInvite, setAnchorElInvite] = useState(null);
  const openInvite = Boolean(anchorElInvite);
  const [emailInvite, setEmailInvite] = useState("");

  // State quản lý Filter
  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "filter-popover" : undefined;

  // mở Popover
  const handleOpenFilterPopover = (event) => {
    setAnchorElFilter(event.currentTarget);
  };

  // đống Popover
  const handleCloseFilterPopover = () => {
    setAnchorElFilter(null);
  };

  const handleInviteUser = async () => {
    if (!emailInvite) return;

    try {
      await inviteUserToBoardAPI(board._id, emailInvite);
      toast.success("Mời thành viên thành công!");
      setEmailInvite("");
      setAnchorElInvite(null);
      // Mẹo nhỏ: Reload trang để cập nhật danh sách thành viên mới vào Board
      // (Cách xịn hơn là update state board ở component cha nhưng reload là nhanh nhất)
      window.location.reload();
    } catch (error) {
      toast.error(
        "Lỗi: " +
          (error?.response?.data?.message || "Không thể mời người dùng này")
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        paddingX: 2,
        overflowX: "auto",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
        borderBottom: "1px solid white",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={{
            color: "white",
            bgcolor: "transparent",
            border: "none",
            paddingX: "5px",
            borderRadius: "4px",
            "& .MuiSvgIcon-root": { color: "white" },
            "&:hover": { bgcolor: "primary.50" },
          }}
          icon={<DashboardIcon />}
          label={board?.title}
          clickable
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          size="small"
          icon={<FilterListIcon />}
          label="Filters"
          clickable
          onClick={handleOpenFilterPopover}
          aria-describedby={idFilter}
        />

        {/* Thay thế nội dung FilterModal bằng nội dung Popover */}
        <FilterContent
          sx={{ borderRadius: "10px" }}
          anchorEl={anchorElFilter}
          onClose={handleCloseFilterPopover}
        />
        {/* NÚT INVITE */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAddIcon />}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              borderColor: "white",
              bgcolor: "white",
              color: "primary.main",
            },
          }}
          onClick={(e) => setAnchorElInvite(e.currentTarget)}
        >
          Invite
        </Button>

        {/* POPOVER FORM INVITE */}
        <Popover
          open={openInvite}
          anchorEl={anchorElInvite}
          onClose={() => setAnchorElInvite(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 0.5 }}
        >
          <Box sx={{ p: 2, width: "300px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontSize: "1rem", fontWeight: "bold" }}
            >
              Mời người vào Board
            </Typography>
            <TextField
              fullWidth
              label="Nhập email"
              size="small"
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleInviteUser}>
              Mời
            </Button>
          </Box>
        </Popover>

        <AvatarGroup
          max={4}
          sx={{
            "& .MuiAvatar-root": {
              width: 30,
              height: 30,
              fontSize: 16,
              border: "none",
            },
          }}
        >
          {board?.members?.map((member, index) => (
            <Tooltip key={index} title={member.user?.name}>
              <Avatar alt={member.user?.name} src={member.user?.avatarUrl} />
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  );
}

export default BoardBar;
