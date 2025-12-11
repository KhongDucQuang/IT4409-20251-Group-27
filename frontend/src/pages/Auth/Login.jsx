// src/pages/Auth/Login.jsx
import { useState } from 'react'
import { Box, Button, TextField, Typography, Container, Card, CardContent, Avatar } from '@mui/material'
import { loginAPI } from '~/apis/authApi'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined' // Import thêm icon để trang trí

function Login() {
  // --- GIỮ NGUYÊN LOGIC CŨ CỦA BẠN ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await loginAPI({ email, password })
      localStorage.setItem('accessToken', res.token)
      localStorage.setItem('userInfo', JSON.stringify(res.user))
      toast.success('Đăng nhập thành công!')
      navigate('/boards')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đăng nhập thất bại!')
    }
  }
  // ------------------------------------

  return (
    // Box bao ngoài để căn giữa màn hình và tạo màu nền
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #F0F2F5, #E3F2FD)', // Màu nền Gradient nhẹ
      padding: 2
    }}>
      <Container component="main" maxWidth="xs">
        {/* Sử dụng Card để tạo khối nổi bật */}
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>

            {/* Icon ổ khóa trang trí */}
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Trello App
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Đăng nhập để tiếp tục
            </Typography>

            <Box component="form" sx={{ mt: 1, width: '100%' }}>
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
                // Bonus: Thêm sự kiện nhấn Enter để login (không ảnh hưởng logic chính)
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large" // Nút to hơn
                sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                    Bạn chưa có tài khoản? Đăng ký ngay
                  </Typography>
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login