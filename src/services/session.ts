import axios from 'axios';

export interface Participant {
  id: number;
  nickname: string;
}

export interface SessionDetail {
  id: number;
  title: string;
  mode: string;
  language: string;
  ownerId: number;
  alreadyJoined: boolean;
  participants: Participant[];
}

export interface Session {
  id: number;
  title: string;
  language: string;
  mode: '문제풀이' | '웹편집';
  isEnded: boolean;
}

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

export const getSessionList = async (
  page = 1,
  limit = 20,
): Promise<Session[]> => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sessions?page=${page}&limit=${limit}`,
  );

  return res.data.sessions;
};

export const joinSession = async (
  token: string,
  sessionId: number,
): Promise<SessionDetail> => {
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
