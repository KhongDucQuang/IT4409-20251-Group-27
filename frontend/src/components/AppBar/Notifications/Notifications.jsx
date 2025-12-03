import { useState, useEffect } from 'react'
import { Badge, Box, IconButton, Tooltip, Menu, MenuItem, Typography, Button, Divider, Avatar } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { fetchNotificationsAPI, markNotificationAsReadAPI, markAllAsReadAPI } from '~/apis/notificationApi'
import moment from 'moment' // Cần cài moment để format thời gian (hoặc dùng new Date().toLocaleString())

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // Hàm fetch dữ liệu
  const fetchNotifications = async () => {
    try {
      // Backend trả về: { data: [...], metadata: {...} } do ta đã phân trang
      const res = await fetchNotificationsAPI()
      // Nếu backend trả về mảng trực tiếp thì dùng res, nếu trả về object phân trang thì dùng res.data
      setNotifications(Array.isArray(res) ? res : res.data)
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  // Gọi API khi component render lần đầu
  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    // Khi mở menu, có thể fetch lại cho mới
    fetchNotifications()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
        await markNotificationAsReadAPI(notification.id)
        // Cập nhật UI local
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n))
    }
  }

  const handleMarkAllAsRead = async () => {
      await markAllAsReadAPI()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  // Đếm số lượng chưa đọc
  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0

  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleClickNotificationIcon}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsNoneIcon sx={{ color: 'white' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 360,
            maxHeight: 400,
            overflowY: 'auto',
            '&:before': { // Mũi tên tam giác trỏ lên
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1 }}>
          <Typography variant="h6" fontSize="1rem" fontWeight="bold">Notifications</Typography>
          <Tooltip title="Mark all as read">
             <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead() }}>
                <DoneAllIcon fontSize="small" color="primary" />
             </IconButton>
          </Tooltip>
        </Box>
        <Divider />

        {/* Danh sách thông báo */}
        {!notifications || notifications.length === 0 ? (
           <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">You have no notifications</Typography>
           </Box>
        ) : (
           notifications.map((notif) => (
             <MenuItem 
                key={notif.id} 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2, 
                    whiteSpace: 'normal', // Cho phép xuống dòng
                    bgcolor: notif.isRead ? 'transparent' : '#e3f2fd' // Xanh nhạt nếu chưa đọc
                }}
                onClick={() => handleMarkAsRead(notif)}
             >
                {/* Avatar người gửi */}
                <Avatar src={notif.sender?.avatarUrl} alt="sender" sx={{ width: 32, height: 32, mt: 0.5 }} />
                
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                        {notif.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {/* Dùng moment để hiện '5 minutes ago' hoặc new Date */}
                        {new Date(notif.createdAt).toLocaleString()}
                    </Typography>
                </Box>
                
                {/* Chấm xanh nếu chưa đọc */}
                {!notif.isRead && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1.5 }} />}
             </MenuItem>
           ))
        )}
      </Menu>
    </Box>
  )
}

export default Notifications