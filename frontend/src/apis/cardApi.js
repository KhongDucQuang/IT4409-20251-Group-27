import axiosClient from './axiosClient'

// Cập nhật thông tin card (Title, Description, Cover...)
export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await axiosClient.patch(`/cards/${cardId}`, updateData)
  return response
}

// Tạo comment mới
export const createNewCommentAPI = async (cardId, commentData) => {
  // commentData: { content }
  const response = await axiosClient.post(`/cards/${cardId}/comments`, commentData)
  return response
}

export const assignMemberAPI = async (cardId, userId) => {
  const response = await axiosClient.post(`/cards/${cardId}/assignees`, { userId })
  return response
}

// Hủy gán thành viên
export const unassignMemberAPI = async (cardId, userId) => {
  const response = await axiosClient.delete(`/cards/${cardId}/assignees/${userId}`)
  return response
}

export const createAttachmentAPI = async (cardId, file) => {
  // Khi upload file, phải dùng FormData
  const formData = new FormData();
  formData.append('file', file); // 'file' phải khớp với tên trong upload.single('file') ở Backend

  const response = await axiosClient.post(`/cards/${cardId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;
};

export const deleteCardAPI = async (cardId) => {
  const response = await axiosClient.delete(`/cards/${cardId}`)
  return response
}

// --- CHECKLISTS ---
export const createChecklistAPI = async (cardId, title) => {
  const response = await axiosClient.post(`/cards/${cardId}/checklists`, { title });
  return response;
};

export const deleteChecklistAPI = async (checklistId) => {
  const response = await axiosClient.delete(`/checklists/${checklistId}`);
  return response;
};

// --- CHECKLIST ITEMS ---
export const createChecklistItemAPI = async (checklistId, content) => {
  const response = await axiosClient.post(`/checklists/${checklistId}/items`, { content });
  return response;
};

export const updateChecklistItemAPI = async (itemId, data) => {
  // data: { isCompleted: true/false } hoặc { content: '...' }
  const response = await axiosClient.patch(`/checklistItems/${itemId}`, data);
  return response;
};

export const deleteChecklistItemAPI = async (itemId) => {
  const response = await axiosClient.delete(`/checklistItems/${itemId}`);
  return response;
};