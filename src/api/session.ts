import api from '../utils/api';

export const createSession = async (data: {
  title: string;
  mode: string;
  language: string;
}) => {
  const res = await api.post('/sessions', data);
  return res.data;
};

export const getSessionList = async (page = 1, limit = 20) => {
  const res = await api.get(`/sessions?page=${page}&limit=${limit}`);
  return res.data.sessions;
};

export const joinSession = async (sessionId: number) => {
  const res = await api.post(`/sessions/${sessionId}/join`);
  return res.data;
};
