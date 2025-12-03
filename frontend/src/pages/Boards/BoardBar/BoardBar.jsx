import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip, Button, Popover, TextField, Typography } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useState } from 'react'
import { inviteUserToBoardAPI } from '~/apis/boardApi'
import { toast } from 'react-toastify'

function BoardBar({ board }) {
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

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      borderBottom: '1px solid white'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip sx={{ color: 'white', bgcolor: 'transparent', border: 'none', paddingX: '5px', borderRadius: '4px', '& .MuiSvgIcon-root': { color: 'white' }, '&:hover': { bgcolor: 'primary.50' } }}
          icon={<DashboardIcon />} label={board?.title} clickable />
        <Chip sx={{ color: 'white', bgcolor: 'transparent', border: 'none', paddingX: '5px', borderRadius: '4px', '& .MuiSvgIcon-root': { color: 'white' }, '&:hover': { bgcolor: 'primary.50' } }}
          icon={<VpnLockIcon />} label={board?.type} clickable />
        <Chip sx={{ color: 'white', bgcolor: 'transparent', border: 'none', paddingX: '5px', borderRadius: '4px', '& .MuiSvgIcon-root': { color: 'white' }, '&:hover': { bgcolor: 'primary.50' } }}
          icon={<AddToDriveIcon />} label="Add to Google Drive" clickable />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* NÚT INVITE */}
        <Button 
            variant="outlined" 
            startIcon={<PersonAddIcon />}
            sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'white', color: 'primary.main' } }}
            onClick={(e) => setAnchorElInvite(e.currentTarget)}
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

        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 34, height: 34, fontSize: 16, border: 'none' } }}>
          {board?.members?.map((member, index) => (
             <Tooltip key={index} title={member.user?.name}>
                <Avatar alt={member.user?.name} src={member.user?.avatarUrl} />
             </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar