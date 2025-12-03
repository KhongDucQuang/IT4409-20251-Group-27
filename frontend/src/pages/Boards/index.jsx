// src/pages/Boards/index.jsx
import { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, CardActionArea, Pagination } from '@mui/material';
import AppBar from '~/components/AppBar/AppBar';
import { fetchBoardsAPI } from '~/apis/boardApi';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '~/components/Modal/CreateBoardModal/CreateBoardModal';

function Boards() {
  const [boards, setBoards] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const navigate = useNavigate();
  
  // State quản lý modal tạo board
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    fetchBoardsAPI('?page=1&limit=12').then(res => {
      setBoards(res.data);
      setMetadata(res.metadata);
    });
  }, []);

  if (!boards) return <div>Loading...</div>;

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      
      <Container sx={{ marginTop: '20px' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Your Boards
        </Typography>

        <Grid container spacing={2}>
          {/* Render danh sách board */}
          {boards.map(board => (
            <Grid item xs={12} sm={6} md={3} key={board.id}>
              <Card sx={{ height: '100px', backgroundColor: '#1976d2', color: 'white' }}>
                <CardActionArea 
                  sx={{ height: '100%' }}
                  onClick={() => navigate(`/boards/${board.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {board.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
           
           {/* Card đặc biệt để tạo board mới */}
           <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardActionArea 
                    sx={{ height: '100%' }}
                    onClick={() => setOpenCreateModal(true)} // <--- BẤM ĐỂ MỞ MODAL
                >
                  <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    + Create new board
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
        </Grid>

        {/* Phân trang */}
        {metadata && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             <Pagination count={metadata.totalPages} color="primary" />
          </Box>
        )}

        {/* Modal Tạo Board */}
        <CreateBoardModal 
          isOpen={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      </Container>
    </Container>
  );
}

export default Boards;