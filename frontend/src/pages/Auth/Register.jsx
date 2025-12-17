// src/pages/Auth/Register.jsx
import { useState } from 'react'
import { Box, Button, TextField, Typography, Container, Alert, Card, CardContent, Avatar } from '@mui/material'
import { registerAPI } from '~/apis/authApi'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined' // Import thêm icon để trang trí

function Register() {
  // ==========================================
  // 👇 GIỮ NGUYÊN LOGIC CỦA BẠN 100%
  // ==========================================
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }
    setError(null)

    try {
      await registerAPI({ email, password, name })
      toast.success('Đăng ký thành công! Hãy đăng nhập.')
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại!')
      toast.error('Đăng ký thất bại')
    }
  }
  // ==========================================
  // 👆 HẾT PHẦN LOGIC
  // ==========================================

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        // Background Gradient đồng bộ với trang Login
        background: 'linear-gradient(to bottom right, #F0F2F5, #E3F2FD)',
        padding: 2
      }}
    >
      <Container component="main" maxWidth="xs">
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            
            {/* Icon ổ khóa trang trí */}
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
              Đăng ký tài khoản
            </Typography>

            <Box component="form" sx={{ mt: 1, width: '100%' }}>
              {/* Hiển thị thông báo lỗi */}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
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
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // UX: Nhấn Enter ở ô cuối cùng thì gọi hàm đăng ký luôn
                onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
                onClick={handleRegister}
              >
                Đăng ký
              </Button>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                    Đã có tài khoản? Đăng nhập ngay
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

export default Register