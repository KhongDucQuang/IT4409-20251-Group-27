<<<<<<< HEAD
import DashboardIcon from '@mui/icons-material/Dashboard'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/formatter'
import { useState } from 'react'
import { inviteUserToBoardAPI } from '~/apis/boardApi'
import { toast } from 'react-toastify'
const MENU_STYLES ={
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
=======
import DashboardIcon from "@mui/icons-material/Dashboard";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import BoltIcon from "@mui/icons-material/Bolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { capitalizeFirstLetter } from "~/utils/formatter";
import { useState } from "react";
import FilterModal from "./Modals/FilterModal";

const MENU_STYLES = {
  color: "white",
  bgcolor: "transparent",
  border: "none",
  paddingX: "5px",
  borderRadius: "4px",
  ".MuiSvgIcon-root": {
    color: "white",
>>>>>>> 0e5ad0bb0cc95c501f4c77f48b063a6fb389d65b
  },
  "&:hover": {
    bgcolor: "primary.50",
  },
};
function BoardBar({ board }) {
<<<<<<< HEAD
  // State xử lý Invite
  const [anchorElInvite, setAnchorElInvite] = useState(null)
  const openInvite = Boolean(anchorElInvite)
  const [emailInvite, setEmailInvite] = useState('')

  const handleInviteUser = async () => {
    if (!emailInvite) return

    try {
      await inviteUserToBoardAPI(board._id, emailInvite)
      toast.success('Mời thành viên thành công!')
      setEmailInvite('')
      setAnchorElInvite(null)
      // Mẹo nhỏ: Reload trang để cập nhật danh sách thành viên mới vào Board
      // (Cách xịn hơn là update state board ở component cha nhưng reload là nhanh nhất)
      window.location.reload()
    } catch (error) {
      toast.error('Lỗi: ' + (error?.response?.data?.message || 'Không thể mời người dùng này'))
    }
  }
=======
  // State quản lý Modal Lọc
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const handleOpenFilterModal = () => setOpenFilterModal(true);
  const handleCloseFilterModal = () => setOpenFilterModal(false);
>>>>>>> 0e5ad0bb0cc95c501f4c77f48b063a6fb389d65b
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
      }}
    >
      {/* Board bar content goes here */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label={board?.title}
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
          onClick={handleOpenFilterModal}
        />
        {/* Render Modal Lọc */}
        <FilterModal open={openFilterModal} onClose={handleCloseFilterModal} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": { borderColor: "white" },
          }}
        >
          Invite
        </Button>

        {/* POPOVER FORM INVITE */}
        <Popover
          open={openInvite}
          anchorEl={anchorElInvite}
          onClose={() => setAnchorElInvite(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, width: '300px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}>Mời người vào Board</Typography>
            <TextField
              fullWidth
              label="Nhập email"
              size="small"
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleInviteUser}>Mời</Button>
          </Box>
        </Popover>
        <AvatarGroup
          max={4}
          sx={{
            gap: "10px",
            "& .MuiAvatar-root": {
              width: 34,
              height: 34,
              fontSize: 16,
              border: "none",
              color: "white",
              cursor: "pointer",
              "&:first-of-type": { bgcolor: "#a4b0be" },
            },
          }}
        >
          <Tooltip title="MeoCute">
            <Avatar
              alt="MeoCute"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"
            />
          </Tooltip>
          <Tooltip title="VitCute">
            <Avatar
              alt="VitCute"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-16.jpg"
            />
          </Tooltip>
          <Tooltip title="HiHi">
            <Avatar
              alt="HiHi"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-11.jpg"
            />
          </Tooltip>
          <Tooltip title="HaHa">
            <Avatar
              alt="HaHa"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-9.jpg"
            />
          </Tooltip>
          <Tooltip title="MeoCute">
            <Avatar
              alt="MeoCute"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"
            />
          </Tooltip>
          <Tooltip title="MeoCute">
            <Avatar
              alt="MeoCute"
              src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"
            />
          </Tooltip>
          {/* {board?.members?.map((member, index) => (
             <Tooltip key={index} title={member.user?.name}>
                <Avatar alt={member.user?.name} src={member.user?.avatarUrl} />
             </Tooltip>
          ))} */}
        </AvatarGroup>
      </Box>
    </Box>
  );
}

export default BoardBar;
