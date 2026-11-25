import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const getListings = () => api.get('/listings');
export const createListing = (data) => api.post('/listings', data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}`);
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (data) => api.post('/messages', data);
export const getUsers = () => api.get('/users');

export default api;