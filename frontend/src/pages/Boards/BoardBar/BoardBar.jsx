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
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/formatter'

const MENU_STYLES ={
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}
function BoardBar({ board }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
      }}
    >
      {/* Board bar content goes here */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon/>}
          label={board?.title}
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon/>}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon/>}
          label="Add To Google Drive"
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon/>}
          label="Automation"
          clickable
        />

        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon/>}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon/>}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          max={4}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title="MeoCute">
            <Avatar alt="MeoCute" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"/>
          </Tooltip>
          <Tooltip title="VitCute">
            <Avatar alt="VitCute" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-16.jpg"/>
          </Tooltip>
          <Tooltip title="HiHi">
            <Avatar alt="HiHi" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-11.jpg"/>
          </Tooltip>
          <Tooltip title="HaHa">
            <Avatar alt="HaHa" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-9.jpg"/>
          </Tooltip>
          <Tooltip title="MeoCute">
            <Avatar alt="MeoCute" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"/>
          </Tooltip>
          <Tooltip title="MeoCute">
            <Avatar alt="MeoCute" src="https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg"/>
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
