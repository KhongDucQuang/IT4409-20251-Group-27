import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ContentCut from "@mui/icons-material/ContentCut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";
import Cloud from "@mui/icons-material/Cloud";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useRef, useState } from "react"; // <--- THÊM useState
import Tooltip from "@mui/material/Tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import AddCardIcon from "@mui/icons-material/AddCard";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ListCards from "./ListCards/ListCards";
import { mapOrder } from "~/utils/sorts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TextField from "@mui/material/TextField"; // <--- THÊM
import CloseIcon from "@mui/icons-material/Close"; // <--- THÊM
import { useConfirm } from "material-ui-confirm"; // Import hook

// 1. Nhận thêm prop createNewCard
function Column({
  column,
  createNewCard,
  handleSetActiveCard,
  handleDeleteColumn,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: { ...column },
  });

  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "100%",
    opacity: isDragging ? 0.5 : undefined,
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // --- LOGIC MỚI: TẠO CARD ---
  const [openNewCardForm, setOpenNewCardForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

  const addNewCard = async () => {
    if (!newCardTitle) return;

    // Gọi API tạo card mới, truyền vào title và columnId
    await createNewCard({ title: newCardTitle, columnId: column._id });

    toggleOpenNewCardForm();
    setNewCardTitle("");
  };
  const confirm = useConfirm();
  const confirmDeleteColumn = () => {
    confirm({
      title: "Xóa cột?",
      description: `Hành động này sẽ xóa vĩnh viễn cột "${column.title}" và toàn bộ thẻ bên trong!`,
      confirmationText: "Xác nhận",
      cancellationText: "Hủy",
    })
      .then(() => {
        // Khi người dùng bấm "Xác nhận"
        handleDeleteColumn(column._id);
      })
      .catch(() => {
        // Khi người dùng bấm "Hủy" (Không làm gì cả)
      });
  };
  // ---------------------------
  // Khai báo ref cho container của form nhập liệu
  const newCardTextareaRef = useRef(null);
  React.useEffect(() => {
    // Hàm xử lý sự kiện click bên ngoài
    const handleClickOutside = (event) => {
      // 1. Kiểm tra nếu form đang mở
      // 2. Kiểm tra nếu điểm click không nằm trong Box chứa form
      if (
        newCardTextareaRef.current &&
        !newCardTextareaRef.current.contains(event.target)
      ) {
        setOpenNewCardForm(false); // Ẩn form nhập liệu
      }
    };

    // Thêm event listener khi component mount (form được mở)
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openNewCardForm]); // Chỉ chạy lại khi trạng thái form thay đổi
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, "_id");

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: "280px",
          maxWidth: "280px",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#333643" : "#ebecf0",
          ml: 2,
          borderRadius: "12px",
          height: "fit-content",
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          display: "flex", // Sử dụng flexbox
          flexDirection: "column", // Xếp các phần tử theo chiều dọc
        }}
      >
        {/* Box Column Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            varient="h6"
            sx={{ fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}
          >
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title="More Options">
              <MoreHorizIcon
                sx={{ color: "text.primary", cursor: "pointer" }}
                id="basic-column-dropdown"
                aria-controls={open ? "basic-menu-column-dropdown" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-workspaces"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{ "aria-labelledby": "basic-column-dropdown" }}
            >
              <MenuItem>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={confirmDeleteColumn}>
                <ListItemIcon>
                  <DeleteForeverIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Box List Card */}
        <ListCards
          cards={orderedCards}
          handleSetActiveCard={handleSetActiveCard}
        />

        {/* Box Column Footer (ĐÃ SỬA ĐỂ NHẬP LIỆU) */}
        <Box
          sx={{
            p: (theme) => theme.spacing(1, 1.3, 1, 1.3),
            ...(openNewCardForm
              ? { height: "auto" } // Form mở → giãn chiều cao
              : { height: (theme) => theme.trello.columnFooterHeight }), // Mặc định
          }}
        >
          {!openNewCardForm ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: (theme) => theme.trello.columnFooterHeight - 16,
              }}
            >
              <Button
                startIcon={<AddIcon />}
                onClick={toggleOpenNewCardForm} // Thêm onClick để mở form
              >
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ cursor: "pointer" }} />
              </Tooltip>
            </Box>
          ) : (
            <Box
              ref={newCardTextareaRef}
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <TextField
                placeholder="Enter card title..."
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd="true" // Quan trọng: chặn kéo thả khi đang nhập
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                // === CHỈNH SỬA TẠI ĐÂY ===
                sx={{
                  "& input": {
                    color: (theme) => theme.palette.text.primary,
                    // Tinh chỉnh paddingY lên 12px (1.5 * 8px) để khớp chiều cao với CardContent
                    paddingY: (theme) => theme.spacing(2),
                    "&::placeholder": {
                      color: (theme) => theme.palette.text.secondary,
                      opacity: 1,
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    // MÀU NỀN CỦA CARD (Dark mode)
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "#2f3137" : "white",
                    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)", // Box Shadow giống Card
                    borderRadius: "10px",

                    // Loại bỏ viền mặc định khi không focus
                    "& fieldset": {
                      borderColor: "transparent",
                      borderWidth: 0,
                    },

                    "&:hover fieldset": {
                      borderColor: "transparent",
                    },

                    // Thêm viền nổi bật khi focus
                    "&.Mui-focused fieldset": {
                      borderColor: (theme) => theme.palette.primary.main,
                      boxShadow: (theme) =>
                        `0 0 0 0.5px ${theme.palette.primary.main}`,
                    },
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={addNewCard}
                  sx={{
                    boxShadow: "none",
                    whiteSpace: "nowrap",
                    borderRadius: "10px",
                    "&:hover": {
                      bgcolor: (theme) => theme.palette.primary.main,
                    },
                  }}
                >
                  Add card
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}
export default Column;
