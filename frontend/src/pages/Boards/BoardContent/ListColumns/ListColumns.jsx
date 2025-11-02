import Box from '@mui/material/Box'
import React from 'react'
import Column from './Column/Column'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Button from '@mui/material/Button'

function ListColumns() {

  return (
    <Box sx={{
      bgcolor: 'inherit',
      width:'100%',
      height: '100%',
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      {/* Columns will be rendered here */}
      <Column />
      <Column />
      <Column />
      <Column />
      <Box sx={{ 
        minWidth: '200px', 
        maxWidth: '200px',
        mx: 2,
        borderRadius: '6px',
        height: 'fit-content',
        bgcolor: '#ffffff3d',
        }}>
        <Button 
          startIcon = {<NoteAddIcon/>}
          sx = {{
            color: 'white',
            width: '100%',
            justifyContent: 'flex-start',
            pl: 2.5,
          }}
        
        >Add new column</Button>
      </Box>
    </Box>
    )
}
export default ListColumns;