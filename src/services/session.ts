import api from '../utils/api';

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

export interface SessionListResponse {
  sessions: Session[];
  totalCount: number;
  currentPage: number;
}

export const createSession = async (data: {
  title: string;
  mode: string;
  language: string;
}) => {
  const res = await api.post('/sessions', data);
  return res.data;
};

export const getSessionList = async (
  page = 1,
  limit = 20,
): Promise<SessionListResponse> => {
  const res = await api.get(`/sessions?page=${page}&limit=${limit}`);
  return res.data;
};

export const joinSession = async (
  sessionId: number,
): Promise<SessionDetail> => {
  const res = await api.post(`/sessions/${sessionId}/join`, {});
  console.log(res);
  return res.data;
};
