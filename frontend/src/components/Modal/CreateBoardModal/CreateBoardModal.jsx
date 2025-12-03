import { useState } from 'react'
import { Modal, Box, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material'
import { createBoardAPI } from '~/apis/boardApi'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  outline: 'none'
}

function CreateBoardModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('public') // 'public' hoặc 'private'
  const navigate = useNavigate()

  const handleCreateBoard = async () => {
    if (!title) {
      toast.error('Vui lòng nhập tên Board!')
      return
    }

    try {
      // 1. Gọi API tạo board
      const newBoard = await createBoardAPI({ title, description, type })
      
      // 2. Thông báo thành công
      toast.success('Tạo bảng thành công!')
      
      // 3. Đóng modal và reset form
      onClose()
      setTitle('')
      setDescription('')
      
      // 4. Chuyển hướng ngay đến bảng vừa tạo
      navigate(`/boards/${newBoard.id}`)

    } catch (error) {
      toast.error('Lỗi tạo bảng')
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Create new board
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Board Title"
            variant="outlined"
            size="small"
            fullWidth
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <TextField
            label="Description"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Visibility</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <FormControlLabel value="public" control={<Radio />} label="Public" />
              <FormControlLabel value="private" control={<Radio />} label="Private" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
             <Button onClick={onClose} color="inherit">Cancel</Button>
             <Button onClick={handleCreateBoard} variant="contained">Create</Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default CreateBoardModal