// src/pages/Auth/Register.jsx
import { useState } from 'react'
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material'
import { registerAPI } from '~/apis/authApi'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  
  const navigate = useNavigate() // Hook để chuyển trang

  const handleRegister = async () => {
    // 1. Validate mật khẩu xác nhận
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
      // 2. Gọi API đăng ký
      await registerAPI({ email, password, name })
      
      // 3. Thông báo thành công
      toast.success('Đăng ký thành công! Hãy đăng nhập.')
      
      // 4. Chuyển hướng về trang Login
      navigate('/login')

    } catch (err) {
      // Xử lý lỗi từ Backend trả về
      setError(err?.response?.data?.message || 'Đăng ký thất bại!')
      toast.error('Đăng ký thất bại')
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Đăng ký tài khoản
        </Typography>
        
        <Box component="form" sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="normal" required fullWidth label="Full Name" autoFocus
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth label="Email Address"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth label="Password" type="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth label="Confirm Password" type="password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleRegister}>
            Đăng ký
          </Button>
          
          {/* Link quay lại trang Login nếu lỡ bấm nhầm */}
          <Box sx={{ textAlign: 'center' }}>
             <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Đã có tài khoản? Đăng nhập ngay
                </Typography>
             </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Register