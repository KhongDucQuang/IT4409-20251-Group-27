import React, { useState, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Chip, // Dùng để hiển thị tệp đã chọn
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";

const ATTACH_FILE_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: "8px",
};

function AttachFileModal({ open, onClose, cardId }) {
  const [link, setLink] = useState("");
  const [displayText, setDisplayText] = useState("");
  // State mới: Lưu trữ tệp đã chọn (chỉ là file object, chưa upload)
  const [selectedFiles, setSelectedFiles] = useState([]);
  // State để quản lý trạng thái tải lên (ví dụ: 'idle', 'uploading', 'success', 'error')
  const [uploadStatus, setUploadStatus] = useState("idle");

  // 1. State mới: Lưu trữ một MẢNG các tệp đã chọn

  // Hàm xử lý xóa tệp đã chọn trên UI
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };
  // Hàm đóng modal và reset toàn bộ state
  const handleCloseAndReset = () => {
    setSelectedFiles([]); // Reset về mảng rỗng
    setLink("");
    setDisplayText("");
    setUploadStatus("idle");
    onClose();
  };

  // Logic upload file lên server
  const uploadFileToServer = (files) => {
    setUploadStatus("uploading");

    // 1. Tạo FormData cho TỪNG TỆP (hoặc tất cả nếu API hỗ trợ)
    // Ví dụ: Lặp qua từng tệp để upload
    files.forEach((file, index) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("cardId", cardId);
      // Có thể gọi fetch/axios ở đây cho từng tệp hoặc gọi một lần
      console.log(
        `Đang tải tệp [${index + 1}/${files.length}]: "${
          file.name
        }" lên server...`
      );
    });

    // VÍ DỤ GIẢ LẬP THÀNH CÔNG CHO TẤT CẢ TỆP:
    setTimeout(() => {
      setUploadStatus("success");
      console.log(`Tải ${files.length} tệp lên server thành công (giả lập)!`);

      setTimeout(() => {
        handleCloseAndReset();
      }, 500);
    }, 2000);
  };

  // Logic đính kèm liên kết
  const handleAttachLink = () => {
    // ... (logic gọi API đính kèm liên kết) ...
    console.log(`Đang đính kèm liên kết: ${link}`);
    // Sau khi API thành công:
    handleCloseAndReset();
  };

  // Hàm xử lý khi người dùng chọn tệp (chỉ lưu vào state)
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files); // Chuyển FileList sang Array
    if (newFiles.length > 0) {
      // Chỉ thêm các tệp chưa tồn tại (để tránh trùng lặp nếu người dùng chọn nhiều lần)
      setSelectedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const uniqueNewFiles = newFiles.filter(
          (f) => !existingNames.has(f.name)
        );
        return [...prev, ...uniqueNewFiles];
      });
    }
    event.target.value = null; // Reset input
  };

  // Xử lý khi bấm nút Đính kèm (Attach)
  const handleAttach = () => {
    if (uploadStatus === "uploading") return;

    if (selectedFiles.length > 0) {
      // Trường hợp 1: Có tệp, tiến hành upload
      uploadFileToServer(selectedFiles);
    } else if (link.trim()) {
      // Trường hợp 2: Có liên kết, tiến hành đính kèm liên kết
      handleAttachLink();
    }
  };

  // Kiểm tra điều kiện kích hoạt nút "Đính kèm"
  const isAttachButtonEnabled =
    (selectedFiles.length > 0 || link.trim().length > 0) &&
    uploadStatus !== "uploading";

  // Hiển thị TẤT CẢ các tệp đã chọn
  const renderSelectedFiles = selectedFiles.length > 0 && (
    <Box sx={{ mt: 1, mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
      {selectedFiles.map((file) => (
        <Chip
          key={file.name}
          icon={<AttachFileIcon />}
          label={file.name}
          // Gọi hàm xóa theo tên tệp
          onDelete={() => handleRemoveFile(file.name)}
          deleteIcon={<ClearIcon />}
          variant="outlined"
          color="primary"
        />
      ))}
    </Box>
  );
  return (
    <Modal
      open={open}
      onClose={handleCloseAndReset}
      aria-labelledby="attach-file-title"
    >
      <Box sx={ATTACH_FILE_STYLE}>
        {/* Header và nút đóng */}
        {/* ... (Code Header) ... */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
            pb: 1,
            mb: 2,
          }}
        >
          <Typography id="attach-file-title" variant="h6" component="h2">
            Attach
          </Typography>
          <IconButton onClick={handleCloseAndReset} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 1. Tải tệp từ máy tính */}
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          Attach files from your computer
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Hiển thị tên tệp đã chọn */}
          {renderSelectedFiles}

          {/* Nút Chọn tệp */}
          <Button
            variant="contained"
            component="label"
            sx={{
              position: "relative",
              overflow: "hidden",
              alignSelf: "flex-start",
            }}
            // KHÔNG vô hiệu hóa nút Chọn tệp, cho phép chọn thêm
            disabled={uploadStatus === "uploading"}
          >
            Select file
            <input
              type="file"
              onChange={handleFileChange}
              multiple={true} // <--- THAY ĐỔI QUAN TRỌNG: Cho phép chọn nhiều tệp
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </Button>
        </Box>

        <Divider sx={{ mb: 3, mt: 1 }} />

        {/* 2. Dán liên kết */}
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          Search or paste links *
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Find recent links or paste a new one"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          disabled={uploadStatus === "uploading"} // Tắt khi đang upload
        />

        {/* 3. Văn bản hiển thị */}
        {/* ... (Các TextField cho DisplayText) ... */}
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          Text displayed (optional)
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Text to display"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          sx={{ mb: 1 }}
          disabled={uploadStatus === "uploading"}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mb: 3 }}>
          Provide a title or description for this link
        </Typography>

        {/* Nút Đính kèm cuối cùng */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            mt: 1,
            justifyContent: "flex-start", // <-- Căn nội dung sang trái
          }}
        >
          <Button
            variant="contained"
            onClick={handleAttach}
            disabled={!isAttachButtonEnabled}
            sx={{
              bgcolor: (theme) => theme.palette.primary.main,
              "&:hover": { bgcolor: (theme) => theme.palette.primary.dark },
              // Không cần alignSelf: 'flex-start' nữa vì Box cha đã căn trái
            }}
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Insertion"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default AttachFileModal;
