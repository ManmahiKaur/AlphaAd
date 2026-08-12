import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL.endsWith('/') ? `${rawBaseURL}api/v1` : `${rawBaseURL}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
