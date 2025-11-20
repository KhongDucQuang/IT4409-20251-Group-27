import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'

import { DndContext, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove, defaultAnimateLayoutChanges } from '@dnd-kit/sortable'


import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}
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

  // cùng 1 thời điểm chỉ có thể 1 item được kéo thả column hoặc card
  const[activeDragItemId, setActiveDragItemId] = useState(null)
  const[activeDragItemType, setActiveDragItemType] = useState(null)
  const[activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOderColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }
  , [board])

  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }
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
    setActiveDragItemType(null)
    setActiveDragItemId(null)
    setActiveDragItemData(null)
  }

  // console.log('setActiveDragItemId: ', setActiveDragItemId)
  // console.log('setActiveDragItemType: ', setActiveDragItemType)
  // console.log('setActiveDragItemData: ', setActiveDragItemData)
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({styles: {active: {opacity: '0.5'} } })
  }
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent