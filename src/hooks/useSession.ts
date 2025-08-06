import { useState, useEffect } from 'react';
import {
  createSession,
  getSessionList,
  joinSession,
} from '../services/session';
import type { Session } from '../services/session';

export const useSession = () => {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessionList();
      setSessionList(data);
    } catch (error) {
      console.error('세션 목록 조회 실패:', error);
      setError('세션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: {
    title: string;
    mode: string;
    language: string;
  }) => {
    try {
      setError(null);
      const result = await createSession(roomData);
      await fetchSessions(); // 목록 새로고침
      return result;
    } catch (error) {
      console.error('방 생성 실패:', error);
      throw error;
    }
  };

  const joinRoom = async (sessionId: number) => {
    try {
      setError(null);
      await joinSession(sessionId);
    } catch (error) {
      console.error('세션 참여 실패:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessionList,
    loading,
    error,
    fetchSessions,
    createRoom,
    joinRoom,
  };
};
