import { useState } from 'react'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import Box from '@mui/material/Box'
import AppsIcon from '@mui/icons-material/Apps'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import Typography from '@mui/material/Typography'
import Workspaces from './Menu/Workspaces.jsx'
import Recent from './Menu/Recent.jsx'
import Starred from './Menu/Starred.jsx'
import Templates from './Menu/Templates.jsx'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profiles from './Menu/Profiles.jsx'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import Notifications from './Notifications/Notifications'
// Import Modal Tạo Board
import CreateBoardModal from '~/components/Modal/CreateBoardModal/CreateBoardModal'

// 👇 NHẬN PROPS TỪ CHA (searchValue, setSearchValue)
function AppBar({ searchValue, setSearchValue }) {
  // State quản lý modal tạo board
  const [openCreateModal, setOpenCreateModal] = useState(false)

  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50' : '#1565c0')
      }}
    >
      {/* --- CỘT TRÁI --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AppsIcon sx={{ color: 'white' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SvgIcon component={TrelloIcon} fontSize='small' inheritViewBox sx={{ color: 'white' }} />
          <Typography varient="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>Trello</Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
          <Button
            sx={{
              color: 'white',
              border: 'none',
              '&:hover': { border: 'none' }
            }}
            variant="outlined"
            startIcon={<LibraryAddIcon/>}
            onClick={() => setOpenCreateModal(true)} // <--- BẤM ĐỂ MỞ MODAL
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* --- CỘT PHẢI --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="outlined-search"
          label="Search cards..."
          type="text"
          size="small"
          // 👇 Dùng giá trị từ props
          value={searchValue}
          // 👇 Gọi hàm từ props
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment:(
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }}/>
              </InputAdornment>
            ),
            endAdornment:(
              <CloseIcon
                sx={{ color: searchValue ? 'white' : 'transparent', cursor: 'pointer', fontSize: 'small' }}
                onClick={() => setSearchValue('')}
              />
            )
          }}
          sx={{
            minWidth: '120px',
            maxWidth: '180px',
            '& label': { color: 'white' },
            '& input': { color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: 'white' },
              '&.Mui-focused fieldset': { borderColor: 'white' }
            }
          }}/>
        
        <ModeSelect />
        <Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{ cursor: 'pointer', color: 'white' }} />
        </Tooltip>

        <Profiles />
      </Box>

      {/* Modal Tạo Board */}
      <CreateBoardModal 
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      />
    </Box>
  )
}

export default AppBar