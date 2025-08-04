import axios from 'axios';

export const createSession = async (
  token: string,
  data: { title: string; mode: string; language: string },
) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sessions`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getSessionList = async (page = 1, limit = 20) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sessions?page=${page}&limit=${limit}`,
  );

  return res.data.sessions;
};

export const joinSession = async (token: string, sessionId: number) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sessions/${sessionId}/join`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};
