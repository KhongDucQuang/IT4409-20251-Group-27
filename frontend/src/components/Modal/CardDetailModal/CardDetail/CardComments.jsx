// CardDetail/CardComments.jsx

import React, { useState } from "react";
import { Box, Typography, Avatar, TextField, Button } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { socket } from "~/socket";

function CardComments({
  cardData,
  setCardData,
  loggedInUser,
  onPostComment,
  onReply,
  commentInputRef,
  boardId,
}) {
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const handlePost = () => {
    // Gọi hàm post từ component cha
    onPostComment(commentText, setCommentText);
    setIsCommenting(false);
  };

  const handleCancelComment = () => {
    setCommentText("");
    setIsCommenting(false);
  };

  // --- Handlers cho Comment List ---

  const handleReplyInternal = (userName) => {
    setCommentText(`@${userName} `);
    setIsCommenting(true);
    onReply(userName); // Focus vào input
  };

  // 4. Edit Comment (GIẢ LẬP - Cần triển khai API thực tế)
  const handleSaveEdit = (commentId) => {
    if (!editingContent.trim()) return;
    toast.info("Chức năng sửa bình luận đang được phát triển.");

    // Dùng logic update tạm thời: (Immutable Update)
    setCardData((prevCard) => ({
      ...prevCard,
      comments: prevCard.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              content: editingContent.trim(),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    }));

    setEditingCommentId(null);
    setEditingContent("");
    socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
  };

  // 5. Delete Comment (GIẢ LẬP - Cần triển khai API thực tế)
  const handleDeleteComment = (commentId) => {
    toast.warn("Chức năng xóa bình luận đang được phát triển.");

    // Dùng logic xóa tạm thời: (Immutable Update)
    setCardData((prevCard) => ({
      ...prevCard,
      comments: prevCard.comments.filter((c) => c.id !== commentId),
    }));

    socket.emit("FE_UPDATE_BOARD", { boardId: boardId });
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6">Comments</Typography>
      {/* Comment Input */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Avatar
          sx={{
            bgcolor: loggedInUser?.avatarColor || "#5c6bc0",
            width: 32,
            height: 32,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {loggedInUser?.fullName
            ? loggedInUser.fullName.substring(0, 2).toUpperCase()
            : "Me"}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={isCommenting ? 3 : 1}
            placeholder="Write a comment..."
            variant="outlined"
            size="small"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsCommenting(true)}
            sx={{ transition: "rows 0.3s" }}
            inputRef={commentInputRef}
          />
          {isCommenting && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                onClick={handlePost}
                disabled={!commentText.trim()}
              >
                Save
              </Button>
              <Button variant="text" onClick={handleCancelComment}>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Danh sách Comments */}
      <Box sx={{ mt: 2 }}>
        {cardData?.comments?.map((commentItem) => {
          const commentUserId = (
            commentItem.user?.id ||
            commentItem.user?._id ||
            commentItem.userId
          )
            ?.toString()
            .trim();
          const currentUserId = (loggedInUser?._id || loggedInUser?.id)
            ?.toString()
            .trim();
          const isMyComment =
            currentUserId && commentUserId && currentUserId === commentUserId;
          const isCurrentlyEditing = editingCommentId === commentItem.id;
          const commentUser = commentItem.user;

          return (
            <Box key={commentItem._id} sx={{ display: "flex", gap: 1, mb: 2 }}>
              {/* 1. Avatar */}
              <Avatar
                sx={{
                  bgcolor: commentUser?.avatarColor || "#7e57c2",
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  flexShrink: 0,
                }}
                alt={commentUser?.name}
                src={commentUser?.avatarUrl}
              >
                {commentUser?.name
                  ? commentUser.name.substring(0, 2).toUpperCase()
                  : "AN"}
              </Avatar>

              {/* 2. Nội dung Comment */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {commentUser?.name || "Anonymous"}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {commentItem.createdAt
                      ? dayjs(commentItem.createdAt).fromNow()
                      : "Unknown time"}
                  </Typography>
                </Typography>

                {/* EDIT MODE / VIEW MODE */}
                {isCurrentlyEditing ? (
                  <Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      multiline
                      autoFocus
                    />
                    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveEdit(commentItem.id)}
                        disabled={!editingContent.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      p: 1,
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      {commentItem.content}
                    </Typography>
                  </Box>
                )}

                {/* ACTIONS (REPLY / EDIT / DELETE) */}
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  {!isMyComment && (
                    <Button
                      size="small"
                      sx={{ textTransform: "none" }}
                      onClick={() => handleReplyInternal(commentUser?.name)}
                    >
                      Reply
                    </Button>
                  )}

                  {isMyComment && !isCurrentlyEditing && (
                    <>
                      <Button
                        size="small"
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                          setEditingContent(commentItem.content);
                          setEditingCommentId(commentItem.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{ textTransform: "none" }}
                        onClick={() => handleDeleteComment(commentItem.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CardComments;
