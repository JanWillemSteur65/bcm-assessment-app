import axios from 'axios';
import { getToken } from './auth.js';

export const api = axios.create();
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
