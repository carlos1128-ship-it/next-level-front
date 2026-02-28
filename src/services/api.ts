import axios from 'axios';

const rawEnvBaseUrl =
  import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || '';
const rawBaseUrl = String(rawEnvBaseUrl).trim().replace(/\/+$/, '');
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
