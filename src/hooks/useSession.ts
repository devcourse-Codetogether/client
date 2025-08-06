import { useState, useEffect } from 'react';
import {
  createSession,
  getSessionList,
  joinSession,
} from '../services/session';
import type { Session, SessionListResponse } from '../services/session';

export const useSession = () => {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // 추가 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(6); // 초기값 6개
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [showPagination, setShowPagination] = useState(false); // 페이지네이션 표시 여부
  const [totalCount, setTotalCount] = useState(0); // 전체 데이터 개수

  const fetchSessions = async (limit = 6) => {
    try {
      setLoading(true);
      setError(null);

      const response: SessionListResponse = await getSessionList(1, limit);
      setSessionList(response.sessions);
      setCurrentLimit(limit);
      setHasMore(response.sessions.length === limit);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('세션 목록 조회 실패:', error);
      setError('세션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSessions = async () => {
    try {
      setLoadingMore(true); // 추가 로딩 상태 사용
      setError(null);

      const newLimit = 20;
      const response: SessionListResponse = await getSessionList(1, newLimit);
      setSessionList(response.sessions);
      setCurrentLimit(newLimit);
      setHasMore(response.sessions.length === newLimit);
      setShowPagination(true); // 페이지네이션 표시
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('더 많은 세션 로드 실패:', error);
      setError('더 많은 세션을 불러오는데 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  const changePage = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const itemsPerPage = 20;
      const response: SessionListResponse = await getSessionList(
        page,
        itemsPerPage,
      );
      setSessionList(response.sessions);
      setCurrentPage(page);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('페이지 변경 실패:', error);
      setError('페이지를 불러오는데 실패했습니다.');
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
      await fetchSessions(currentLimit);
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
    fetchSessions(6); // 초기 로드 시 6개만
  }, []);

  // totalPages를 프론트엔드에서 계산
  const totalPages = Math.ceil(totalCount / 20);

  return {
    sessionList,
    loading,
    loadingMore, // 추가 로딩 상태 반환
    error,
    hasMore,
    currentLimit,
    currentPage,
    showPagination,
    totalPages, // 프론트엔드에서 계산한 전체 페이지 수
    fetchSessions,
    loadMoreSessions,
    changePage,
    createRoom,
    joinRoom,
  };
};
