import { Box, Grid, Card, CardContent, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { mockData } from '~/apis/mock-data'
import AppBar from '~/components/AppBar/AppBar'

function BoardList() {
  const navigate = useNavigate()

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />
      <Box sx={{ p: 4, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'), flexGrow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>Your Boards</Typography>
        <Grid container spacing={2}>
          {mockData?.boards?.map((board) => (
            <Grid item xs={12} sm={6} md={3} key={board._id}>
              <Card
                sx={{ cursor: 'pointer', bgcolor: '#e9ebee', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'black' }}>{board.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'black' }}>{board.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default BoardList