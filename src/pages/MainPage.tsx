import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import TextField from '../components/common/TextField';
import RoomCard from '../components/mainpage/RoomCard';
import Button from '../components/common/Button';
import CreateRoomModal from '../components/mainpage/CreateRoomModal';
import FilterModal from '../components/mainpage/FilterModal';
import {
  createSession,
  getSessionList,
  joinSession,
} from '../services/session';
import type { Session, SessionDetail } from '../services/session';
import { useUserStore } from '../stores/useUserStore';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken } = useUserStore();
  const [searchValue, setSearchValue] = useState('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sessionList, setSessionList] = useState<Session[]>([]);

  const fetchSessions = async () => {
    try {
      const data = await getSessionList();
      setSessionList(data);
    } catch (error) {
      console.error('세션 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSearch = (value: string) => {
    alert(`검색어: ${value}`);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleFilterConfirm = (filterData: {
    mode: string;
    language: string;
  }) => {
    console.log('필터 적용:', filterData);
    alert(
      `필터가 적용되었습니다!\n모드: ${filterData.mode}\n언어: ${filterData.language}`,
    );
    setIsFilterModalOpen(false);
  };

  const handleCreateRoom = async (roomData: {
    title: string;
    mode: string;
    language: string;
  }) => {
    try {
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      const result = await createSession(accessToken, roomData);
      alert(`새 방이 생성되었습니다!\n방 ID: ${result.id}`);
      setIsCreateRoomModalOpen(false);
      await fetchSessions();
    } catch (error) {
      console.error(error);
      alert('방 생성 중 오류가 발생했습니다.');
    }
  };

  const handleJoinSession = async (sessionId: number) => {
    try {
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 세션 참여 API 호출 - 상세 정보 받기
      const sessionDetail: SessionDetail = await joinSession(
        accessToken,
        sessionId,
      );

      // 이미 참여 중인 경우 처리
      if (sessionDetail.alreadyJoined) {
        alert('이미 참여 중인 세션입니다.');
      } else {
        alert('세션에 참여했습니다!');
      }

      // 성공 시 CodeEditorPage로 이동
      navigate(`/editor/${sessionId}`);
    } catch (error) {
      console.error('세션 참여 에러:', error);
      alert('세션 참여 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-0 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            함께 코딩하며 성장하세요
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            실시간 협업을 통해 문제를 해결하고 새로운 기술을 배워보세요
          </p>
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            text="새 방 만들기"
            color="primary"
            className="px-6 py-3 text-base"
            onClick={() => setIsCreateRoomModalOpen(true)}
          />
        </div>

        {/* 방 목록 섹션 */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">활성 방 목록</h2>
            <div className="flex items-center gap-4">
              <TextField
                placeholder="방 제목 검색..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchValue);
                  }
                }}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                className="w-64"
              />
              <Button
                icon={<FunnelIcon className="w-4 h-4" />}
                text="필터"
                color="light"
                onClick={handleFilterClick}
                className="text-sm w-full h-full"
              />
            </div>
          </div>

          {/* 동적 방 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionList.map((session) => (
              <RoomCard
                key={session.id}
                title={session.title}
                techStack={`</> ${session.language}`}
                category={session.mode}
                onJoin={() => handleJoinSession(session.id)}
              />
            ))}
          </div>

          {/* 더 많은 방 보기 */}
          <div className="text-center mt-8">
            <Button
              text="더 많은 방 보기"
              color="light"
              className="hover:text-primary-600 font-medium transition-colors"
            />
          </div>
        </div>
      </main>
      <Footer />

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        onConfirm={handleCreateRoom}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onConfirm={handleFilterConfirm}
      />
    </div>
  );
};

export default MainPage;
