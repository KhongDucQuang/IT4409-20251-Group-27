import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import { DndContext, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10, //  phai di chuyen 10 pixel truoc khi kich hoat keo tha
    },
  })
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })
  // nhan 250ms va dung sai cam ung 500px moi kich hoat keo tha tren thiet bi cam ung
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 500,
    },
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOderColumns] = useState([]) 

  useEffect(() => {
    setOderColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }
  , [board])

  const handleDragEnd = (event) => {
    console.log('handleDragEnd', event)
    const {active, over} = event
    
    if(!over) return; // neu khong co over thi thoat

    if (active.id !== over.id) {
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id) // lay vi tri truoc khi di chuyen
      const newIndex = orderedColumns.findIndex(c => c._id === over.id) // lay vi tri sau khi di chuyen

      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // sau goi API luu thay doi thu tu cot o day
      // const newColumnOrderIds = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns: ', dndOrderedColumns)
      // console.log('dndOrderedColumns IDs: ', dndOrderedColumnsIds)

      setOderColumns(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
      </Box>
    </DndContext>
  )
}

export default BoardContent