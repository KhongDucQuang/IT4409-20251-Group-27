// src/pages/Auth/Login.jsx
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import { loginAPI } from "~/apis/authApi";
import { useNavigate, Link } from "react-router-dom"; // 1. Import Link
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginAPI({ email, password });

      console.log("Phản hồi toàn bộ (res):", res);
      console.log("Đối tượng User (res.user):", res.user);

      localStorage.setItem("accessToken", res.token);
      localStorage.setItem("userInfo", JSON.stringify(res.user));
      toast.success("Đăng nhập thành công!");
      navigate("/boards");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Đăng nhập Trello Clone
        </Typography>

        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>

          {/* 2. Thêm dòng này để chuyển hướng sang trang Đăng ký */}
          <Box sx={{ textAlign: "center" }}>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Typography variant="body2" color="primary">
                Bạn chưa có tài khoản? Đăng ký ngay
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
