import axios from 'axios';
import { AuthUser } from '../state/AuthContext';

let currentUser: AuthUser | null = null;

export const setAuthUser = (u: AuthUser | null) => { currentUser = u; };

export const api = axios.create({
  baseURL: '' // proxy /api via Vite dev server
});

api.interceptors.request.use(config => {
  if (currentUser?.token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${currentUser.token}`;
  }
  return config;
});
