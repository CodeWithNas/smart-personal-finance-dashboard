import api from './api';

export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  const { token } = res.data;
  if (token) {
    localStorage.setItem('token', token);
  }
  return res.data;
};

export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
