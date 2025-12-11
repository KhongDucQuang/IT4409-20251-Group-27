// src/apis/boardApi.js
import axiosClient from './axiosClient'
import { generatePlaceholderCard } from '../utils/formatter'
import { mapOrder } from '../utils/sorts'

/**
 * Hàm này biến dữ liệu từ Backend (Prisma) -> Frontend (Mock Data Structure)
 */
const transformBoardData = (beBoard) => {
  if (!beBoard) return null

  // 1. Map 'lists' -> 'columns'
  // 2. Map 'id' -> '_id'
  // 3. Xử lý sort & placeholder card

  const feBoard = {
    ...beBoard,
    _id: beBoard.id, // Map id
    columns: beBoard.lists.map(list => {
      // Xử lý từng list
      const feList = {
        ...list,
        _id: list.id,
        boardId: beBoard.id,
        // Map 'cards' bên trong list
        cards: list.cards.map(card => ({
          ...card,
          _id: card.id,
          columnId: list.id,
          boardId: beBoard.id
        }))
      }

      // Backend Prisma đã sort sẵn bằng 'orderBy: { position: 'asc' }'
      // Nhưng Frontend cần mảng 'cardOrderIds'
      feList.cardOrderIds = feList.cards.map(c => c._id)

      // Xử lý Placeholder Card (nếu list rỗng)
      if (feList.cards.length === 0) {
        feList.cards = [generatePlaceholderCard(feList)]
        feList.cardOrderIds = [feList.cards[0]._id]
      }

      return feList
    })
  }

  // Tạo columnOrderIds cho Board
  feBoard.columnOrderIds = feBoard.columns.map(c => c._id)

  // Xóa trường thừa (optional)
  delete feBoard.lists
  delete feBoard.id

  return feBoard
}

// === CÁC HÀM GỌI API ===

export const fetchBoardDetailsAPI = async (boardId) => {
  // Gọi API backend thật
  const response = await axiosClient.get(`/boards/${boardId}`)

  // Biến hình dữ liệu trước khi trả về cho Component
  return transformBoardData(response)
}

export const createNewColumnAPI = async (newColumnData) => {
  // newColumnData: { title, boardId }
  const response = await axiosClient.post('/lists', newColumnData)

  // Backend trả về: { id, title, boardId, ... }
  // Frontend cần: { _id, title, boardId, cardOrderIds: [], cards: [] }
  return {
    ...response,
    _id: response.id,
    cardOrderIds: [],
    cards: []
  }
}

export const createNewCardAPI = async (newCardData) => {
  // newCardData: { title, listId }
  const response = await axiosClient.post('/cards', newCardData)

  // Backend trả về: { id, title, listId, ... }
  // Frontend cần: { _id, title, columnId, ... }
  return {
    ...response,
    _id: response.id,
    columnId: response.listId
  }
}

export const fetchBoardsAPI = async (searchPath) => {
  // searchPath sẽ là chuỗi query, ví dụ: '?page=1&limit=12'
  const response = await axiosClient.get(`/boards${searchPath || ''}`)
  return response
}

export const createBoardAPI = async (data) => {
  const response = await axiosClient.post('/boards', data)
  return response
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  // updateData: { listOrderIds: [...] }
  const response = await axiosClient.put(`/boards/${boardId}/move_list`, updateData)
  return response
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  // updateData chứa boardId, currentCardId, prev... next...
  const response = await axiosClient.put(`/boards/${updateData.boardId}/move_card`, updateData)
  return response
}

export const deleteColumnAPI = async (columnId) => {
  const response = await axiosClient.delete(`/lists/${columnId}`)
  return response
}

export const inviteUserToBoardAPI = async (boardId, email) => {
  const response = await axiosClient.post(`/boards/${boardId}/members`, { email })
  return response
}