// src/pages/Boards/index.jsx
import { useState, useEffect } from 'react'
import { Container, Box, Typography, Grid, Card, CardActionArea, Pagination, Divider } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import { fetchBoardsAPI } from '~/apis/boardApi'
import { useNavigate } from 'react-router-dom'
import CreateBoardModal from '~/components/Modal/CreateBoardModal/CreateBoardModal'
// Import thêm icon để trang trí
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CircularProgress from '@mui/material/CircularProgress'

function Boards() {
  const [boards, setBoards] = useState([])
  const [metadata, setMetadata] = useState(null)
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  // State quản lý modal tạo board
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    fetchBoardsAPI('?page=1&limit=12').then(res => {
      setBoards(res.data)
      setMetadata(res.metadata)
    })
  }, [])

  // Giữ nguyên logic check loading, chỉ làm đẹp giao diện loading
  if (!boards) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <CircularProgress />
      <Typography>Loading...</Typography>
    </Box>
  )

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />

      {/* Box bao ngoài để làm màu nền cho toàn bộ vùng nội dung */}
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: '100%',
        overflowY: 'auto', // Cho phép cuộn nếu danh sách dài
        p: 2
      }}>
        <Container maxWidth="lg">

          {/* Tiêu đề được trang trí thêm Icon và chỉnh màu trắng */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2, color: 'white' }}>
            <SpaceDashboardIcon sx={{ mr: 1, color: 'inherit' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'inherit' }}>
              Your Workspaces
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

          <Grid container spacing={3}>
            {/* 1. Card đặc biệt để tạo board mới (Style kính mờ/nét đứt) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '120px',
                  bgcolor: 'rgba(255, 255, 255, 0.2)', // Nền trong suốt nhẹ
                  border: '1px dashed rgba(255, 255, 255, 0.4)', // Viền nét đứt
                  boxShadow: 'none',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    borderColor: 'white'
                  }
                }}
              >
                <CardActionArea
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                  onClick={() => setOpenCreateModal(true)} // Giữ nguyên logic
                >
                  <AddIcon fontSize="large" sx={{ mb: 1 }} />
                  <Typography variant="body1" fontWeight="500">
                    Create new board
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* 2. Render danh sách board (Style Gradient & Hover) */}
            {boards.map(board => (
              <Grid item xs={12} sm={6} md={3} key={board.id}>
                <Card
                  sx={{
                    height: '120px',
                    // Gradient nền tạo điểm nhấn
                    // Hoặc dùng: bgcolor: 'background.paper' nếu muốn nền trắng đơn giản
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    },
                    // Trang trí vạch màu bên trái
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '6px',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2ecc71' : '#1565c0')
                    }
                  }}
                >
                  <CardActionArea
                    sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                    onClick={() => navigate(`/boards/${board.id}`)} // Giữ nguyên logic
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          // Xử lý text quá dài
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {board.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {board.description || 'No description'}
                      </Typography>
                    </Box>

                    {/* Icon mũi tên trang trí ở góc */}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                      <ArrowForwardIcon fontSize="small" color="action" />
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Phân trang (Chỉnh màu trắng cho nổi trên nền xanh) */}
          {metadata && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={metadata.totalPages}
                color="secondary"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': { color: 'white' },
                  '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              />
            </Box>
          )}

          {/* Modal Tạo Board (Giữ nguyên) */}
          <CreateBoardModal
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        </Container>
      </Box>
    </Container>
  )
}

export default Boards