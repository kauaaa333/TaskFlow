import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://backend-api-black-seven.vercel.app'
    : 'http://localhost:3001');

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(erro);
  },
);

export default api;
