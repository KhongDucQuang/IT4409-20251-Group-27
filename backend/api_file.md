# Trello-like Backend API Documentation

> Base URL: `/api`
>
> Authentication: **JWT Bearer Token** (trừ `/auth`)

---

## 🔐 Auth

### POST /auth/register
**Description:** Đăng ký tài khoản mới

**Body**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response**
```json
{
  "id": "string",
  "email": "string",
  "name": "string"
}
```

---

### POST /auth/login
**Description:** Đăng nhập, trả JWT

**Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

---

## 👤 Users

### GET /users/me
**Description:** Lấy thông tin user hiện tại

**Headers**
```
Authorization: Bearer <token>
```

**Response**
```json
{
  "id": "string",
  "email": "string",
  "name": "string"
}
```

---

### PATCH /users/me
**Description:** Cập nhật profile

**Body**
```json
{
  "name": "string"
}
```

---

## 📋 Boards

### GET /boards
**Description:** Lấy danh sách board

**Query**
```
?page=1&limit=10
```

**Response**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string"
    }
  ],
  "total": 10
}
```

---

### POST /boards
**Description:** Tạo board mới

**Body**
```json
{
  "title": "string"
}
```

---

### GET /boards/:boardId
**Description:** Lấy chi tiết board (lists + cards)

---

### PATCH /boards/:boardId
**Body**
```json
{
  "title": "string"
}
```

---

### DELETE /boards/:boardId

---

### POST /boards/:boardId/members
**Description:** Thêm member vào board

**Body**
```json
{
  "userId": "string"
}
```

---

## 📂 Lists

### POST /lists
**Body**
```json
{
  "boardId": "string",
  "title": "string"
}
```

---

### PATCH /lists/:listId
```json
{
  "title": "string",
  "position": 1
}
```

---

### DELETE /lists/:listId

---

## 🃏 Cards

### POST /cards
```json
{
  "listId": "string",
  "title": "string",
  "description": "string"
}
```

---

### PATCH /cards/:cardId
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2025-01-01"
}
```

---

### DELETE /cards/:cardId

---

### POST /cards/:cardId/assignees
```json
{
  "userId": "string"
}
```

---

### POST /cards/:cardId/labels
```json
{
  "labelId": "string"
}
```

---

### POST /cards/:cardId/comments
```json
{
  "content": "string"
}
```

---

### POST /cards/:cardId/attachments
**Form-data**
```
file: <binary>
```

---

## 💬 Comments

### DELETE /comments/:commentId

---

## 📎 Attachments

### DELETE /attachments/:attachmentId

---

## 🏷 Labels

### PATCH /labels/:labelId
```json
{
  "name": "string",
  "color": "string"
}
```

---

### DELETE /labels/:labelId

---

## ✅ Checklists

### POST /cards/:cardId/checklists
```json
{
  "title": "string"
}
```

---

### PATCH /checklists/:checklistId
```json
{
  "title": "string"
}
```

---

### DELETE /checklists/:checklistId

---

## ☑ Checklist Items

### POST /checklists/:checklistId/items
```json
{
  "content": "string"
}
```

---

### PATCH /checklistItems/:itemId
```json
{
  "content": "string",
  "completed": true
}
```

---

### DELETE /checklistItems/:itemId

---

## 🔔 Notifications

### GET /notifications
**Query**
```
?page=1&limit=10
```

---

### PATCH /notifications/:id/read

---

### PATCH /notifications/read-all

