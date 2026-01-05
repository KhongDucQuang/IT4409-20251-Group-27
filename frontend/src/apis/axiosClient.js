// src/apis/axiosClient.js
import axios from 'axios';
import { API_ROOT } from '../utils/constants';

const axiosClient = axios.create({
  baseURL: `${API_ROOT}/api`, // http://localhost:8017/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    // Giả sử bạn lưu token trong localStorage khi login
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý response (trả về data gọn gàng)
axiosClient.interceptors.response.use(
  (response) => {
    return response && response.data ? response.data : response;
  },
  (error) => {
    // Xử lý lỗi tập trung (ví dụ: 401 thì logout)
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;