import React, { useState, useEffect, useRef } from "react";
import { Modal, Box, useMediaQuery, useTheme } from "@mui/material";

import AddChecklistModal from "./Modals/AddChecklistModal";
import ManageMembersModal from "./Modals/ManageMembersModal";
import AttachFileModal from "./Modals/AttachFileModal";
import ManageLabelsModal from "./Modals/ManageLabelsModal";
import ManageDateModal from "./Modals/ManageDateModal";

import CardDetailHeader from "./CardDetail/CardDetailHeader";
import CardActionButtons from "./CardDetail/CardActionButtons";
import CardMetaInfo from "./CardDetail/CardMetaInfo";
import CardDescription from "./CardDetail/CardDescription";
import CardChecklists from "./CardDetail/CardChecklists";
import CardAttachments from "./CardDetail/CardAttachments";
import CardComments from "./CardDetail/CardComments";

import { socket } from "~/socket";
import { toast } from "react-toastify";
import { updateCardDetailsAPI, createNewCommentAPI } from "~/apis/cardApi";
import { API_ROOT } from "~/utils/constants";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);
dayjs.locale("en");

const getModalStyle = (isMobile) => ({
  position: "absolute",
  top: isMobile ? 0 : 60,
  left: isMobile ? 0 : "50%",
  transform: isMobile ? "none" : "translateX(-50%)",
  width: isMobile ? "100%" : "90%",
  maxWidth: 1100,
  height: isMobile ? "100%" : "auto",
  minHeight: isMobile ? "100vh" : "50vh",
  maxHeight: isMobile ? "100vh" : "80vh",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  borderRadius: isMobile ? 0 : "8px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: isMobile ? 2 : 4,
});

function CardDetailModal({
  open,
  onClose,
  card,
  boardMembers,
  onDeleteCard,
  onUpdateActiveCard,
}) {
  if (!card) return null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [cardData, setCardData] = useState(card);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    setCardData(card);
  }, [card]);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        setLoggedInUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Parse userInfo error:", error);
      }
    }
  }, [open]);

  const handleUpdateCardField = async (field, value, successMessage) => {
    try {
      await updateCardDetailsAPI(cardData._id, { [field]: value });

      const newCardData = { ...cardData, [field]: value };
      setCardData(newCardData);
      onUpdateActiveCard?.(newCardData);

      if (successMessage) toast.success(successMessage);
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });

      return true;
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi cập nhật ${field}`);
      return false;
    }
  };

  const [openAddChecklist, setOpenAddChecklist] = useState(false);
  const [openManageMembers, setOpenManageMembers] = useState(false);
  const [openAttachFile, setOpenAttachFile] = useState(false);
  const [openManageLabels, setOpenManageLabels] = useState(false);
  const [openManageDate, setOpenManageDate] = useState(false);

  const modalHandlers = {
    openChecklist: () => setOpenAddChecklist(true),
    closeChecklist: () => setOpenAddChecklist(false),
    openMembers: () => setOpenManageMembers(true),
    closeMembers: () => setOpenManageMembers(false),
    openAttach: () => setOpenAttachFile(true),
    closeAttach: () => setOpenAttachFile(false),
    openLabels: () => setOpenManageLabels(true),
    closeLabels: () => setOpenManageLabels(false),
    openDate: () => setOpenManageDate(true),
    closeDate: () => setOpenManageDate(false),
  };

  const commentInputRef = useRef(null);

  const handlePostComment = async (commentText, setCommentText) => {
    if (!commentText.trim() || !loggedInUser) return;

    try {
      const newComment = await createNewCommentAPI(cardData._id, {
        content: commentText.trim(),
      });

      const commentWithUser = {
        ...newComment,
        user: newComment.user || {
          id: loggedInUser.id,
          name: loggedInUser.fullName || loggedInUser.email,
          avatarUrl: loggedInUser.avatarUrl,
        },
      };

      const updatedCard = {
        ...cardData,
        comments: [commentWithUser, ...(cardData.comments || [])],
      };

      setCardData(updatedCard);
      onUpdateActiveCard?.(updatedCard);

      setCommentText("");
      toast.success("Bình luận đã được đăng!");
      socket.emit("FE_UPDATE_BOARD", { boardId: cardData.boardId });
    } catch (error) {
      console.error(error);
      toast.error("Gửi bình luận thất bại");
    }
  };

  const handleReply = () => {
    commentInputRef.current?.focus();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={getModalStyle(isMobile)}>
        <CardDetailHeader
          cardData={cardData}
          onClose={onClose}
          onUpdateCardField={handleUpdateCardField}
          onDeleteCard={onDeleteCard}
        />

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexGrow: 1,
            minHeight: 0,
            "@media (max-width: 600px)": { flexDirection: "column" },
          }}
        >
          <Box
            sx={{
              flex: 2,
              minWidth: 0,
              overflowY: "auto",
              pr: isMobile ? 0 : 1,
              pb: 4,
            }}
          >
            <CardActionButtons handlers={modalHandlers} />

            <CardMetaInfo
              cardData={cardData}
              handlers={modalHandlers}
              boardMembers={boardMembers}
            />

            <CardDescription
              cardData={cardData}
              onUpdateCardField={handleUpdateCardField}
            />

            <CardChecklists
              cardData={cardData}
              setCardData={setCardData}
              boardId={cardData.boardId}
              onUpdateActiveCard={onUpdateActiveCard}
            />

            <CardAttachments
              cardData={cardData}
              setCardData={setCardData}
              onOpenAttachFile={modalHandlers.openAttach}
              API_ROOT={API_ROOT}
              boardId={cardData.boardId}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 280,
              overflowY: "auto",
              p: isMobile ? 0 : 1,
            }}
          >
            <CardComments
              cardData={cardData}
              setCardData={setCardData}
              loggedInUser={loggedInUser}
              onPostComment={handlePostComment}
              onReply={handleReply}
              commentInputRef={commentInputRef}
              boardId={cardData.boardId}
            />
          </Box>
        </Box>

        <AddChecklistModal
          open={openAddChecklist}
          onClose={modalHandlers.closeChecklist}
          card={cardData}
        />

        <ManageMembersModal
          open={openManageMembers}
          onClose={modalHandlers.closeMembers}
          card={cardData}
          boardMembers={boardMembers}
        />

        <AttachFileModal
          open={openAttachFile}
          onClose={modalHandlers.closeAttach}
          card={cardData}
        />

        <ManageLabelsModal
          open={openManageLabels}
          onClose={modalHandlers.closeLabels}
          cardId={cardData._id}
        />

        <ManageDateModal
          open={openManageDate}
          onClose={modalHandlers.closeDate}
          card={cardData}
          cardId={cardData._id}
        />
      </Box>
    </Modal>
  );
}

export default CardDetailModal;
