// src/apis/authApi.js
import axiosClient from './axiosClient'

export const loginAPI = async (data) => {
  // data: { email, password }
  const response = await axiosClient.post('/auth/login', data)
  return response
}

export const registerAPI = async (data) => {
  // data: { email, password, name }
  const response = await axiosClient.post('/auth/register', data)
  return response
}