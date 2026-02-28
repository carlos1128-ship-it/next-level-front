import axios from 'axios';

const rawBaseUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const baseURL = /\/api$/i.test(rawBaseUrl) ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
