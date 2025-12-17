// API Đăng nhập giả lập
export const loginAPI = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@gmail.com' && password === '123') {
        resolve({
          _id: 'user-id-01',
          email: email,
          name: 'Admin',
          username: 'admin',
          avatar: 'https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-13-1.jpg',
          role: 'admin',
          accessToken: 'fake-jwt-token-login'
        })
      } else {
        reject(new Error('Email hoặc Mật khẩu sai rồi!'))
      }
    }, 1000)
  })
}

// API Đăng ký giả lập
export const registerAPI = (email, password, name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'exist@gmail.com') {
        reject(new Error('Email này đã tồn tại!'))
      } else {
        resolve({
          _id: 'user-id-new-' + Math.random().toString(36).substr(2, 9),
          email: email,
          name: name,
          username: name.toLowerCase().replace(/ /g, ''),
          avatar: 'https://thuvienquangngai.vn/wp-content/uploads/2025/01/avatar-vo-tri-ngau-16.jpg',
          role: 'client',
          accessToken: 'fake-jwt-token-register'
        })
      }
    }, 1000)
  })
}