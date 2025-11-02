import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import {Card as MuiCard} from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttackmentIcon from '@mui/icons-material/Attachment'
function Card({temporaryHideMedia}) {
  if(temporaryHideMedia){
    return (
      <MuiCard sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset'
      }}>

        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
          <Typography> QuocNK </Typography>
        </CardContent>
      </MuiCard>
    )
  }
  return (
    <MuiCard sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset'
      }}>
        <CardMedia
          sx={{ height: 140 }}
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc7IGboHMcWwTOI2Sv8I8hNDV9JYaOVNJQvw&s"
          title="green iguana"
        />
        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
          <Typography> QuangPM </Typography>
        </CardContent>
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          <Button size="small" startIcon={<GroupIcon />}>20</Button>
          <Button size="small" startIcon={<CommentIcon />}>15</Button>
          <Button size="small" startIcon={<AttackmentIcon />}>10</Button>
        </CardActions>
      </MuiCard>

  )
}
export default Card;