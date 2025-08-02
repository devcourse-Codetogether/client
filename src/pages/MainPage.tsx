import React, { useState } from 'react';
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

const MainPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  const handleCreateRoom = (roomData: {
    title: string;
    mode: string;
    language: string;
  }) => {
    console.log('새 방 생성:', roomData);
    alert(
      `새 방이 생성되었습니다!\n제목: ${roomData.title}\n모드: ${roomData.mode}\n언어: ${roomData.language}`,
    );
    setIsCreateRoomModalOpen(false);
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
              {/* 검색 필드 */}
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
              />{' '}
              {/* 필터 버튼 */}
              <Button
                icon={<FunnelIcon className="w-4 h-4" />}
                text="필터"
                color="light"
                onClick={handleFilterClick}
                className="text-sm w-full h-full"
              />
            </div>
          </div>

          {/* 방 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoomCard
              title="알고리즘 스터디 - 백준 문제풀이"
              type="algorism"
              id="roomid1"
              techStack="</> Python"
              status="active"
              category="문제풀이"
            />
            <RoomCard
              title="React 프로젝트 협업"
              techStack="</> JavaScript"
              status="active"
              category="웹편집"
            />
            <RoomCard
              title="Java 기초 학습"
              techStack="</> Java"
              status="active"
              category="문제풀이"
            />
            <RoomCard
              title="웹 개발 프로젝트"
              techStack="</> HTML/CSS"
              status="active"
              category="웹편집"
            />
            <RoomCard
              title="Python 데이터 분석"
              techStack="</> Python"
              status="active"
              category="문제풀이"
            />
            <RoomCard
              title="Node.js 백엔드 개발"
              techStack="</> JavaScript"
              status="active"
              category="웹편집"
            />
          </div>

          {/* 더 많은 방 보기 버튼 */}
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

      {/* 새 방 만들기 모달 */}
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
        onConfirm={handleCreateRoom}
      />

      {/* 필터 모달 */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onConfirm={handleFilterConfirm}
      />
    </div>
  );
};

export default MainPage;
