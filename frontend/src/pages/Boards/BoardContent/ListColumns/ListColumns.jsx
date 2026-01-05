import Box from "@mui/material/Box";
import Column from "./Column/Column";
// import NoteAddIcon from "@mui/icons-material/NoteAdd";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField"; // <--- THÊM
import CloseIcon from "@mui/icons-material/Close"; // <--- THÊM
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useRef, useEffect } from "react"; // <--- THÊM
import { toast } from "react-toastify"; // <--- THÊM (Nếu bạn có cài react-toastify, nếu chưa thì dùng alert)

// 1. Nhận thêm prop createNewColumn, createNewCard
function ListColumns({
  columns,
  createNewColumn,
  createNewCard,
  handleSetActiveCard,
  handleDeleteColumn,
}) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const toggleOpenNewColumnForm = () =>
    setOpenNewColumnForm(!openNewColumnForm);

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      // toast.error('Please enter column title!')
      return; // Nếu không có title thì không làm gì
    }

    // Gọi API tạo cột mới
    await createNewColumn({ title: newColumnTitle });

    // Reset lại form
    toggleOpenNewColumnForm();
    setNewColumnTitle("");
  };
  // Khai báo ref cho container của form nhập liệu
  const newColumnTextareaRef = useRef(null);
  useEffect(() => {
    // Hàm xử lý sự kiện click bên ngoài
    const handleClickOutside = (event) => {
      // 1. Kiểm tra nếu form đang mở
      // 2. Kiểm tra nếu điểm click không nằm trong Box chứa form
      if (
        newColumnTextareaRef.current &&
        !newColumnTextareaRef.current.contains(event.target)
      ) {
        setOpenNewColumnForm(false); // Ẩn form nhập liệu
      }
    };

    // Thêm event listener khi component mount (form được mở)
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openNewColumnForm]); // Chỉ chạy lại khi trạng thái form thay đổi

  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: "inherit",
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar-track": { m: 2 },
        }}
      >
        {/* 2. Truyền createNewCard xuống cho Column */}
        {columns?.map((column) => (
          <Column
            key={column._id}
            column={column}
            createNewCard={createNewCard}
            handleSetActiveCard={handleSetActiveCard}
            handleDeleteColumn={handleDeleteColumn}
          />
        ))}

        {/* Box Add new column CTA */}
        {!openNewColumnForm ? (
          <Box
            onClick={toggleOpenNewColumnForm}
            sx={{
              minWidth: "280px",
              maxWidth: "280px",
              mx: 2,
              borderRadius: "12px",
              height: "fit-content",
              bgcolor: "#ffffff3d",
            }}
          >
            <Button
              startIcon={<AddIcon />}
              sx={{
                color: "white",
                width: "100%",
                justifyContent: "flex-start",
                pl: 2.5,
                py: 1,
              }}
            >
              Add new column
            </Button>
          </Box>
        ) : (
          <Box
            ref={newColumnTextareaRef}
            sx={{
              width: "280px",
              height: "100%",
              mx: 2,
              p: 1,
              borderRadius: "12px",
              height: "fit-content",
              bgcolor: "#ffffff3d",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <TextField
              placeholder="Enter column title..."
              type="text"
              size="small"
              variant="outlined"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                "& input": {
                  color: (theme) => theme.palette.text.primary,
                  // Tinh chỉnh paddingY lên 12px (1.5 * 8px) để khớp chiều cao với CardContent
                  "&::placeholder": {
                    color: (theme) => theme.palette.text.secondary,
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-root": {
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                onClick={addNewColumn}
                variant="contained"
                size="small"
                sx={{
                  boxShadow: "none",
                  border: "0.5px solid",
                  borderRadius: "10px",
                  borderColor: (theme) => theme.palette.primary.main,
                  "&:hover": { bgcolor: (theme) => theme.palette.primary.main },
                }}
              >
                Add Column
              </Button>
              <CloseIcon
                fontSize="small"
                sx={{
                  color: "white",
                  cursor: "pointer",
                  "&:hover": { color: (theme) => theme.palette.warning.light },
                }}
                onClick={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        )}
      </Box>
    </SortableContext>
  );
}

export default ListColumns;
