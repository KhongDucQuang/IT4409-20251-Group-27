/*
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}
// Phía FE sẽ tự tạo ra một cái card đặc biệt: Placeholder Card,
// Không liên quan đến back-end, card đặc biệt này sẽ được ẩn ở giao diện UI người dùng.
// Cấu trúc Id của cái card này để unique rất đơn giản, không cần phức tạp
// "columnId-placeholder-card" (mỗi column chỉ có thể có tối đa một cái PlaceHolder Card)
// Quan trọng khi tạo: phải đầy đủ (_id, boardId, columnId, FE_PlaceholderCard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}