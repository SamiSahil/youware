// src/api/axios.js
import axios from 'axios';

// Create a new instance of axios with a custom configuration
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' ||'https://youware-gold.vercel.app/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// IMPORTANT: Interceptor to add the JWT token to every request if it exists
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;