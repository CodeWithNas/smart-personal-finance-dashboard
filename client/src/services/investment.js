import api from './api';

export const getInvestments = async () => {
  const res = await api.get('/investments');
  return res.data;
};

export const createInvestment = async (data) => {
  const res = await api.post('/investments', data);
  return res.data;
};

export const updateInvestment = async (id, data) => {
  const res = await api.put(`/investments/${id}`, data);
  return res.data;
};

export const deleteInvestment = async (id) => {
  const res = await api.delete(`/investments/${id}`);
  return res.data;
};
