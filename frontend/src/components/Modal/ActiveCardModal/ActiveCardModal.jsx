import { useState, useEffect, useRef } from 'react'
import { Modal, Box, Typography, Grid, Stack, Button, TextField, Avatar, AvatarGroup, Popover, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Checkbox, Divider } from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import SubjectIcon from '@mui/icons-material/Subject'
import CloseIcon from '@mui/icons-material/Close'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import DescriptionIcon from '@mui/icons-material/Description'
import AttachmentIcon from '@mui/icons-material/Attachment'
import DeleteIcon from '@mui/icons-material/Delete' // Import nút xóa
import { useConfirm } from 'material-ui-confirm' // <--- THÊM DÒNG NÀY
import { updateCardDetailsAPI, createNewCommentAPI, assignMemberAPI, unassignMemberAPI, createAttachmentAPI, deleteCardAPI } from '~/apis/cardApi'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { 
  createChecklistAPI, deleteChecklistAPI, 
  createChecklistItemAPI, updateChecklistItemAPI, deleteChecklistItemAPI 
} from '~/apis/cardApi';
import LinearProgress from '@mui/material/LinearProgress'; // Thanh tiến độ
import { socket } from '~/socket'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  outline: 'none',
  overflowY: 'auto'
}

function ActiveCardModal({ activeCard, isOpen, onClose, boardMembers }) {
  const [comment, setComment] = useState('')
  const [description, setDescription] = useState(activeCard?.description || '')
  const [checklistIdOpenForm, setChecklistIdOpenForm] = useState(null) // Lưu ID của checklist đang mở form
  const [newItemContent, setNewItemContent] = useState('')
  // State cho Popover Members
  const [anchorElMembers, setAnchorElMembers] = useState(null)
  const openMembers = Boolean(anchorElMembers)
  const [forceUpdate, setForceUpdate] = useState(false)
  const confirm = useConfirm()
  const [title, setTitle] = useState(activeCard?.title || '')
  useEffect(() => {
      // Dùng optional chaining (?.) và OR (||) để tránh lỗi null
      setTitle(activeCard?.title || '')
      setDescription(activeCard?.description || '')
  }, [activeCard])
  const fileInputRef = useRef(null)

  if (!activeCard) return null

  // --- XỬ LÝ COMMENT ---
  const handleAddComment = async () => {
    if (!comment) return
    try {
      const newComment = await createNewCommentAPI(activeCard._id, { content: comment })
      if (!activeCard.comments) activeCard.comments = []
      activeCard.comments.unshift(newComment)
      setComment('')
      
      // ✅ CHỈ BẮN KHI THÀNH CÔNG
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Gửi bình luận thất bại')
    }
  }

  const handleUpdateTitle = async () => {
    if (title === activeCard.title) return
    try {
      await updateCardDetailsAPI(activeCard._id, { title })
      activeCard.title = title 
      toast.success('Đổi tên thẻ thành công!')
      
      // 👇 CHÈN VÀO ĐÂY
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

    } catch (error) {
      toast.error('Lỗi đổi tên thẻ')
    }
  }

  const handleUpdateDescription = async () => {
    if (description === activeCard.description) return
    try {
      await updateCardDetailsAPI(activeCard._id, { description })
      toast.success('Cập nhật mô tả thành công!')
      
      // 👇 CHÈN VÀO ĐÂY
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

    } catch (error) {
      toast.error('Lỗi cập nhật mô tả')
    }
  }

  // --- XỬ LÝ ASSIGN MEMBERS ---
  const handleMemberClick = (event) => setAnchorElMembers(event.currentTarget)
  const handleCloseMembers = () => setAnchorElMembers(null)

  const handleToggleMember = async (userId) => {
    try {
      const isAssigned = activeCard.assignees?.some(a => a.userId === userId)

      if (isAssigned) {
        // Hủy gán
        await unassignMemberAPI(activeCard._id, userId)
        activeCard.assignees = activeCard.assignees.filter(a => a.userId !== userId)
        toast.info('Đã hủy gán thành viên')
        
        // ✅ Bắn socket update board (mất avatar)
        socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

      } else {
        // Gán thành viên
        await assignMemberAPI(activeCard._id, userId)
        
        const userToAdd = boardMembers.find(m => m.user.id === userId)?.user
        if (userToAdd) {
            if (!activeCard.assignees) activeCard.assignees = []
            activeCard.assignees.push({ userId: userToAdd.id, user: userToAdd })
        }
        toast.success('Đã gán thành viên thành công')

        // ✅ Socket 1: Update board (hiện avatar)
        socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

        // ✅ Socket 2: Thông báo riêng
        socket.emit('FE_SEND_NOTIFICATION', { 
            recipientId: userId, 
            boardId: activeCard.boardId 
        })
      }
      setComment(prev => prev) 

    } catch (error) {
      toast.error('Lỗi cập nhật thành viên')
    }
  }

  // --- XỬ LÝ ATTACHMENT ---
  const handleUploadAttachment = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    try {
      const newAttachment = await createAttachmentAPI(activeCard._id, file)
      if (!activeCard.attachments) activeCard.attachments = []
      activeCard.attachments.push(newAttachment)
      toast.success('Upload file thành công!')
      event.target.value = ''
      setComment(prev => prev)
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Lỗi upload file')
    }
  }

  // --- XỬ LÝ XÓA THẺ (DELETE CARD) ---
  const handleDeleteCard = () => {
    confirm({
      title: 'Xóa thẻ?',
      description: `Bạn có chắc chắn muốn xóa vĩnh viễn thẻ "${activeCard?.title}" không? Hành động này không thể hoàn tác!`,
      confirmationText: 'Xác nhận',
      cancellationText: 'Hủy',
    })
      .then(async () => {
        try {
          await deleteCardAPI(activeCard._id)
          toast.success('Đã xóa thẻ thành công')
          
          // ✅ Bắn socket trước khi đóng modal
          socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });

          onClose() 
          // Không reload trang nữa vì socket ở _id.jsx sẽ lo việc này
        } catch (error) {
          toast.error('Lỗi xóa thẻ')
        }
      })
      .catch(() => {})
  }

  // --- XỬ LÝ CHECKLIST ---
  const handleAddChecklist = async () => {
    try {
      // 1. Gọi API tạo mới
      const newChecklist = await createChecklistAPI(activeCard._id, 'To do');
      
      // 2. Cập nhật dữ liệu Local cho User A thấy ngay
      if (!activeCard.checklists) activeCard.checklists = [];
      activeCard.checklists.push({ ...newChecklist, items: [] });
      
      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate(prev => !prev); 

      // 3. Bắn socket cho User B
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });

    } catch (error) {
      toast.error('Lỗi tạo checklist');
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      // 1. Gọi API xóa
      await deleteChecklistAPI(checklistId);
      
      // 2. Cập nhật dữ liệu Local (Lọc bỏ cái vừa xóa)
      // Lưu ý: Kiểm tra kỹ xem backend trả về là "id" hay "_id". Thường là "id" nếu bạn đã map, hoặc "_id" nếu là raw Mongo.
      // Ở đây mình dùng logic an toàn: activeCard.checklists đang hiển thị cái gì thì lọc theo cái đó.
      activeCard.checklists = activeCard.checklists.filter(c => c.id !== checklistId && c._id !== checklistId);
      
      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate(prev => !prev);

      // 3. Bắn socket cho User B
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Lỗi xóa checklist');
    }
  };
  // --- XỬ LÝ CHECKLIST ITEMS ---
  
  // 1. Hàm gọi API thêm item (Logic gốc)
  const handleAddItem = async (checklistId, content) => {
    try {
      const newItem = await createChecklistItemAPI(checklistId, content);
      const checklist = activeCard.checklists.find(c => c.id === checklistId);
      if (checklist) {
          if (!checklist.items) checklist.items = [];
          checklist.items.push(newItem);
      }
      setComment(prev => prev);
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
       toast.error('Lỗi thêm việc');
    }
  };

  // 2. Hàm xử lý sự kiện Submit Form (Dùng cho cả nút Thêm và phím Enter)
  const handleAddItemSubmit = async (checklistId) => {
    if (!newItemContent.trim()) return;
    await handleAddItem(checklistId, newItemContent);
    setNewItemContent(''); 
    // Không cần emit ở đây vì hàm handleAddItem đã emit rồi
  };

  // 3. Hàm tick chọn (Đã sửa Optimistic UI - Cập nhật ngay)
  // 3. Hàm tick chọn (Đã sửa lỗi không cập nhật ngay)
  const handleToggleItem = async (itemId, currentStatus) => {
    // Optimistic UI
    const newStatus = !currentStatus;
    activeCard.checklists.forEach(list => {
      const item = list.items.find(i => i.id === itemId);
      if (item) item.isCompleted = newStatus;
    });
    setForceUpdate(prev => !prev); 

    try {
      await updateChecklistItemAPI(itemId, { isCompleted: newStatus });
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
       toast.error('Lỗi cập nhật trạng thái');
       // Rollback
       activeCard.checklists.forEach(list => {
        const item = list.items.find(i => i.id === itemId);
        if (item) item.isCompleted = currentStatus;
      });
      setForceUpdate(prev => !prev);
    }
  };
  
  const handleDeleteItem = async (itemId) => {
     // 1. Optimistic UI: Xóa trên giao diện NGAY LẬP TỨC
     // Sử dụng map để tạo mảng mới thay vì sửa trực tiếp, giúp React nhận biết thay đổi
     const newChecklists = activeCard.checklists.map(list => {
       if (list.items) {
         return {
           ...list,
           items: list.items.filter(i => i.id !== itemId)
         }
       }
       return list;
     });
     
     activeCard.checklists = newChecklists; // Gán lại mảng mới
     setForceUpdate(prev => !prev); // Ép vẽ lại

     // 2. Gọi API xóa ngầm bên dưới
     try {
       await deleteChecklistItemAPI(itemId);
       
       // 3. Bắn socket cho User B cập nhật
       socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
     } catch (error) {
        toast.error('Lỗi xóa việc');
     }
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        {/* HEADER: Title & Close Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '80%' }}>
            <CreditCardIcon sx={{ color: '#172b4d' }} />
            
            {/* Cho phép sửa Title ngay tại đây */}
            <TextField
                fullWidth
                variant="standard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle} // Lưu khi click ra ngoài
                InputProps={{
                    disableUnderline: true,
                    style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#172b4d' }
                }}
                sx={{
                    '& .MuiInputBase-input': {
                        p: 0.5,
                        borderRadius: 1,
                        '&:focus': { bgcolor: 'white', border: '1px solid primary.main' }
                    }
                }}
            />
          </Box>
          <CloseIcon onClick={onClose} sx={{ cursor: 'pointer', color: '#5e6c84' }} />
        </Box>

        <Grid container spacing={4}>
          {/* CỘT TRÁI */}
          <Grid item xs={9}>
            {/* Members & Labels */}
            <Box sx={{ mb: 3, display: 'flex', gap: 4 }}>
              {activeCard?.assignees?.length > 0 && (
                <Box>
                   <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Members</Typography>
                   <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                    {activeCard.assignees.map((assignee, index) => (
                      <Avatar key={index} alt={assignee.user?.name} src={assignee.user?.avatarUrl} sx={{ width: 32, height: 32 }} />
                    ))}
                  </AvatarGroup>
                </Box>
              )}
            </Box>

            {/* Description */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <SubjectIcon sx={{ color: '#172b4d' }} />
                <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Description</Typography>
              </Box>
              <TextField
                fullWidth multiline minRows={3}
                placeholder="Add a more detailed description..."
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleUpdateDescription}
                sx={{ bgcolor: '#091e420a', '& fieldset': { border: 'none' }, borderRadius: 1 }}
              />
            </Box>

             {/* Attachments List */}
             {activeCard?.attachments?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachmentIcon sx={{ color: '#172b4d' }} />
                  <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Attachments</Typography>
                </Box>
                <Stack spacing={2}>
                  {activeCard.attachments.map((att) => (
                    <Box key={att.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                      <Box sx={{ width: 80, height: 60, borderRadius: 1, overflow: 'hidden', bgcolor: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {att.mimeType.includes('image') 
                           ? <img src={`${API_ROOT}/${att.url}`} alt="att" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           : <AttachmentIcon sx={{ color: 'text.secondary' }} />
                         }
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{att.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(att.uploadedAt).toLocaleString()}</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <a href={`${API_ROOT}/${att.url}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', color: '#172b4d' }}>Download / Open</a>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* ... Attachments List (Code cũ) ... */}

            {/* --- CHECKLIST AREA (Bước 3 - UI) --- */}
            {activeCard?.checklists?.length > 0 && activeCard.checklists.map(checklist => {
              const totalItems = checklist.items?.length || 0;
              const completedItems = checklist.items?.filter(i => i.isCompleted)?.length || 0;
              const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

              return (
                <Box key={checklist.id} sx={{ mb: 3 }}>
                  {/* Header Checklist */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TaskAltIcon sx={{ color: '#172b4d' }} />
                      <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>
                        {checklist.title}
                      </Typography>
                    </Box>
                    <Button size="small" color="error" onClick={() => handleDeleteChecklist(checklist.id)}>Delete</Button>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="caption" sx={{ minWidth: 30 }}>{Math.round(progress)}%</Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ width: '100%', borderRadius: 4, height: 8 }} />
                  </Box>

                  {/* List Items */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {checklist.items?.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox 
                          checked={item.isCompleted} 
                          onChange={() => handleToggleItem(item.id, item.isCompleted)}
                          sx={{ p: 0.5 }}
                        />
                        <TextField
                          fullWidth variant="standard" value={item.content}
                          InputProps={{ disableUnderline: true, readOnly: true }} // Tạm thời readOnly
                          sx={{ 
                             textDecoration: item.isCompleted ? 'line-through' : 'none',
                             color: item.isCompleted ? 'text.secondary' : 'text.primary'
                          }}
                        />
                         <CloseIcon fontSize="small" sx={{ cursor: 'pointer', color: '#ddd', '&:hover': { color: 'error.main' } }} onClick={() => handleDeleteItem(item.id)} />
                      </Box>
                    ))}
                  </Stack>

                  {/* Add New Item Button */}
                  {/* Form thêm item mới (Thay thế cho nút Add cũ) */}
                  <Box sx={{ pl: 4 }}>
                    {checklistIdOpenForm !== checklist.id ? (
                      // 1. Trạng thái bình thường: Hiển thị nút "Add an item"
                      <Button 
                        variant="contained" size="small"
                        sx={{ bgcolor: '#091e420a', color: '#172b4d', boxShadow: 'none', '&:hover': { bgcolor: '#091e4214' } }}
                        onClick={() => setChecklistIdOpenForm(checklist.id)}
                      >
                        Add an item
                      </Button>
                    ) : (
                      // 2. Trạng thái đang nhập: Hiển thị Form Input
                      <Box>
                        <TextField
                          fullWidth
                          autoFocus
                          multiline
                          placeholder="Thêm một mục..."
                          value={newItemContent}
                          onChange={(e) => setNewItemContent(e.target.value)}
                          onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) { // Enter để submit
                               e.preventDefault()
                               handleAddItemSubmit(checklist.id)
                             }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
                              '& fieldset': { borderColor: 'primary.main' },
                              '&:hover fieldset': { borderColor: 'primary.main' },
                              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' }
                            },
                            mb: 1
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            onClick={() => handleAddItemSubmit(checklist.id)}
                            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                          >
                            Thêm
                          </Button>
                          <Button 
                            variant="text" 
                            size="small"
                            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                            onClick={() => {
                              setChecklistIdOpenForm(null)
                              setNewItemContent('')
                            }}
                          >
                            Huỷ
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            })}
            
            {/* Activity & Comments (Code cũ) */}

            {/* Activity & Comments */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DescriptionIcon sx={{ color: '#172b4d' }} />
                <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Activity</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>Me</Avatar>
                <Box sx={{ width: '100%' }}>
                  <TextField fullWidth placeholder="Write a comment..." size="small" value={comment} onChange={(e) => setComment(e.target.value)} sx={{ mb: 1 }} />
                  <Button variant="contained" size="small" disabled={!comment} onClick={handleAddComment}>Save</Button>
                </Box>
              </Box>
              <Stack spacing={2}>
                {activeCard?.comments?.map((comment) => (
                   <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                      <Avatar alt={comment.user?.name} src={comment.user?.avatarUrl} sx={{ width: 32, height: 32 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mr: 1, display: 'inline-block' }}>{comment.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
                        <Box sx={{ p: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : '#f4f5f7', borderRadius: 1, mt: 0.5 }}>
                           <Typography variant="body2" color="text.primary">{comment.content}</Typography>
                        </Box>
                      </Box>
                   </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* CỘT PHẢI - ACTIONS */}
          <Grid item xs={3}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Add to card</Typography>
            <Stack direction="column" spacing={1}>
              <Button variant="contained" color="inherit" startIcon={<GroupIcon />} onClick={handleMemberClick} sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', boxShadow: 'none' }}>Members</Button>
              <Popover open={openMembers} anchorEl={anchorElMembers} onClose={handleCloseMembers} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Box sx={{ p: 2, width: 250 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Assign members</Typography>
                  <List dense>
                    {boardMembers?.map(member => {
                      const isAssigned = activeCard.assignees?.some(a => a.userId === member.user.id)
                      return (
                        <ListItem key={member.id} disablePadding>
                          <ListItemButton onClick={() => handleToggleMember(member.user.id)}>
                            <ListItemAvatar><Avatar alt={member.user.name} src={member.user.avatarUrl} sx={{ width: 28, height: 28 }} /></ListItemAvatar>
                            <ListItemText primary={member.user.name} />
                            <Checkbox edge="end" checked={!!isAssigned} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Popover>

              <Button variant="contained" color="inherit" startIcon={<LocalOfferIcon />} sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', boxShadow: 'none' }}>Labels</Button>
              <Button variant="contained" color="inherit" startIcon={<TaskAltIcon />} onClick={handleAddChecklist} sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', boxShadow: 'none' }}>Checklist</Button>
              
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadAttachment} />
              <Button variant="contained" color="inherit" startIcon={<AttachmentIcon />} onClick={() => fileInputRef.current.click()} sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', boxShadow: 'none' }}>Attachment</Button>

              <Divider sx={{ my: 2 }} />
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteCard} sx={{ justifyContent: 'flex-start', boxShadow: 'none' }}>Delete</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCardModal