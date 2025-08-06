import React from 'react';
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
import Pagination from '../components/common/pagination/Pagination';
import CreateRoomModal from '../components/mainpage/CreateRoomModal';
import FilterModal from '../components/mainpage/FilterModal';
import { useSession } from '../hooks/useSession';
import { useModals } from '../hooks/useModals';
import { useSearchFilter } from '../hooks/useSearchFilter';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessionList,
    loading,
    loadingMore,
    error,
    hasMore,
    showPagination,
    currentPage,
    totalPages,
    loadMoreSessions,
    changePage,
    createRoom,
    joinRoom,
  } = useSession();

  const {
    isCreateRoomModalOpen,
    isFilterModalOpen,
    openCreateRoomModal,
    closeCreateRoomModal,
    openFilterModal,
    closeFilterModal,
  } = useModals();

  const {
    searchValue,
    filterData,
    setSearchValue,
    handleSearch,
    handleFilterConfirm,
  } = useSearchFilter();

  const handleCreateRoom = async (roomData: {
    title: string;
    mode: string;
    language: string;
  }) => {
    try {
      const result = await createRoom(roomData);
      alert(`새 방이 생성되었습니다!\n방 ID: ${result.id}`);
      closeCreateRoomModal();
    } catch (error) {
      console.error(error);
      alert('방 생성 중 오류가 발생했습니다.');
    }
  };

  const handleJoinSession = async (sessionId: number) => {
    try {
      await joinRoom(sessionId);
      navigate(`/editor/${sessionId}`);
    } catch (error) {
      console.error('세션 참여 에러:', error);
      alert('세션 참여 중 오류가 발생했습니다.');
    }
  };

  const handleLoadMore = async () => {
    try {
      await loadMoreSessions();
    } catch (error) {
      console.error('더 많은 방 로드 에러:', error);
      alert('더 많은 방을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handlePageChange = async (page: number) => {
    try {
      await changePage(page);
    } catch (error) {
      console.error('페이지 변경 에러:', error);
      alert('페이지를 변경하는 중 오류가 발생했습니다.');
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
            onClick={openCreateRoomModal}
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
                onClick={openFilterModal}
                className="text-sm w-full h-full"
              />
            </div>
          </div>

          {/* 동적 방 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-600">세션 목록을 불러오는 중...</div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <div className="text-red-600">{error}</div>
              </div>
            ) : sessionList.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-600">
                  현재 활성화된 세션이 없습니다.
                </div>
              </div>
            ) : (
              sessionList.map((session) => (
                <RoomCard
                  key={session.id}
                  title={session.title}
                  techStack={session.language}
                  category={session.mode}
                  onJoin={() => handleJoinSession(session.id)}
                />
              ))
            )}
          </div>

          {/* 더 많은 방 보기 또는 페이지네이션 */}
          <div className="text-center mt-8">
            {!showPagination ? (
              <Button
                text={loadingMore ? '불러오는 중...' : '더 많은 방 보기'}
                color="light"
                className="hover:text-primary-600 font-medium transition-colors"
                onClick={handleLoadMore}
                disabled={loadingMore}
              />
            ) : (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            )}
          </div>
        </div>
      </main>
      <Footer />

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={closeCreateRoomModal}
        onConfirm={handleCreateRoom}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        onConfirm={handleFilterConfirm}
      />
    </div>
  );
};

export default MainPage;
