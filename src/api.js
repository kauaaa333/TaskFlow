import axios from 'axios';
export { mensagensDeErro } from './errosApi';

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://backend-api-black-seven.vercel.app'
    : 'http://localhost:3001');

const api = axios.create({
  baseURL,
  timeout: 20000,
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
    const eLogin = erro.config?.url?.includes('/auth/login');

    if (erro.response?.status === 401 && !eLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    return Promise.reject(erro);
  },
);

export default api;
