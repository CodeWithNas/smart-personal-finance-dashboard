// src/services/api.js
import axios from 'axios';

// Create the Axios instance
const api = axios.create({
  // Read API URL from Vite environment with a localhost fallback
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to automatically attach token (if exists)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage.getItem
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
