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
const MENU_STYLES ={
  color: 'primary.main',
  bgcolor: 'white',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '&.MuiSvgIcon-root': {
    color: 'primary.main',
  },
  '&:hover': {
    bgcolor: 'primary.90',
  }
}
function BoardBar() {
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
        borderTop: '1px solid #55b7f2',
      }}
    >
      {/* Board bar content goes here */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Chip 
        sx={MENU_STYLES}
        icon={<DashboardIcon/>} 
        label="Board Views"
        clickable
        />

        <Chip 
        sx={MENU_STYLES}
        icon={<VpnLockIcon/>} 
        label="Private/Public Workspace"
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

      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        {/* Right side content can go here */}
        <Button variant="outlined" startIcon={<PersonAddIcon/>} >Invite</Button>
        <AvatarGroup 
          max={7}
          sx={{
            '& > .MuiAvatar-root': { width: 34, height: 34, fontSize: 16}
          }}
        >
          <Tooltip title="CNWeb">
            <Avatar alt="CNWeb" src="/static/images/avatar/1.jpg" /> 
          </Tooltip>
          <Tooltip title="TNWeb">
            <Avatar alt="TNWeb" src="/static/images/avatar/1.jpg" /> 
          </Tooltip>
          <Tooltip title="ANWeb">
            <Avatar alt="ANWeb" src="/static/images/avatar/1.jpg" /> 
          </Tooltip>
          <Tooltip title="PNWeb">
            <Avatar alt="PNWeb" src="/static/images/avatar/1.jpg" /> 
          </Tooltip>
          <Tooltip title="CNWeb">
            <Avatar alt="CNWeb" src="/static/images/avatar/1.jpg" /> 
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar

