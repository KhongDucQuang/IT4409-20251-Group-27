import axiosClient from './axiosClient'

// Lấy danh sách thông báo
export const fetchNotificationsAPI = async () => {
  const response = await axiosClient.get('/notifications')
  return response
}

// Đánh dấu 1 thông báo là đã đọc
export const markNotificationAsReadAPI = async (notificationId) => {
  const response = await axiosClient.patch(`/notifications/${notificationId}/read`)
  return response
}

// Đánh dấu tất cả là đã đọc
export const markAllAsReadAPI = async () => {
  const response = await axiosClient.patch('/notifications/read-all')
  return response
}