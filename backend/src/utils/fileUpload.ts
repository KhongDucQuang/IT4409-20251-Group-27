// src/utils/fileUpload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';

// Đảm bảo thư mục 'uploads' tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Lưu file vào thư mục 'uploads/'
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất: timestamp + tên file gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });