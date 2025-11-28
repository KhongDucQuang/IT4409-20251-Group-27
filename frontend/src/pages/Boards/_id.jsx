import { Container, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { mockData } from '~/apis/mock-data'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

function Board() {
  const { boardId } = useParams()
  // Tìm board theo ID
  const board = mockData?.boards?.find(b => b._id === boardId)

  if (!board) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h4">Board not found!</Typography>
      </Container>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  )
}

export default Board