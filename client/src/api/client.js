import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send HTTP-only cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage if available (Bearer fallback)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // Attach extracted message for simpler UI consumption
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;

