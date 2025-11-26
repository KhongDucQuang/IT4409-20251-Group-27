import { Box, Button, TextField, Typography, Alert, CircularProgress, Link } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom' // Import thêm useLocation, Link
import { loginAPI, registerAPI } from '~/apis/mock-auth' // Import cả 2 hàm

function Auth() {
  const navigate = useNavigate()
  const location = useLocation()

  // Kiểm tra xem đang ở trang Login hay Register dựa trên URL
  // Nếu path là /login thì isLogin = true, ngược lại là false (Register)
  const isLogin = location.pathname === '/login'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const data = new FormData(event.currentTarget)
    const email = data.get('email')
    const password = data.get('password')
    const name = data.get('name')
    const passwordConfirmation = data.get('password_confirmation')


    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!')
      setLoading(false)
      return
    }

    if (!isLogin) {
      if (!name) {
        setError('Vui lòng nhập tên hiển thị!')
        setLoading(false)
        return
      }
      if (password !== passwordConfirmation) {
        setError('Mật khẩu nhập lại không khớp!')
        setLoading(false)
        return
      }
    }

    try {
      let userInfo

      if (isLogin) {
        userInfo = await loginAPI(email, password)
      } else {
        userInfo = await registerAPI(email, password, name)
      }

      localStorage.setItem('accessToken', userInfo.accessToken)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      navigate('/boards')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f0f2f5' }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: 400, p: 4, bgcolor: 'white', boxShadow: 3, borderRadius: 2, textAlign: 'center' }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
          {isLogin ? 'Trello Login' : 'Create Account'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

        {!isLogin && (
          <TextField fullWidth label="Full Name" name="name" margin="normal" placeholder="Enter your name..." />
        )}

        <TextField fullWidth label="Email" name="email" margin="normal" />
        <TextField fullWidth label="Password" name="password" type="password" margin="normal" />

        {!isLogin && (
          <TextField fullWidth label="Confirm Password" name="password_confirmation" type="password" margin="normal" />
        )}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }} disabled={loading}>
          {loading ? <CircularProgress color="inherit" size={24} /> : (isLogin ? 'Login' : 'Register')}
        </Button>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
            <Link component={RouterLink} to={isLogin ? '/register' : '/login'} underline="hover" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </Link>
          </Typography>
        </Box>

      </Box>
    </Box>
  )
}

export default Auth