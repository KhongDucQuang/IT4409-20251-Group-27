import { Dashboard } from '@mui/icons-material'
import Box from '@mui/material/Box'
function BoardBar() {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.dark',
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        paddingX: 2,
        overflowX: 'auto',
        borderTop: '1px solid #00bfa5',
      }}
    >
      {/* Board bar content goes here */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Chip icon={<DashboardIcon/>} label="Board Menu" />
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
      </Box>
    </Box>
  )
}

export default BoardBar
