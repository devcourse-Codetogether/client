import React, { useEffect, useState } from 'react';
import CodeTogetherLogo from '../assets/code_together_logo.png';
import { ListBulletIcon } from '@heroicons/react/24/solid';
import LogModal from '../components/mypage/LogModal';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import { useUserStore } from '../stores/useUserStore';
import api from '../utils/api';
import RoomCard from '../components/mypage/RoomCard';
import Pagination from '../components/mypage/Pagination';

interface Room {
  id: number;
  title: string;
  mode: '문제풀이' | '웹편집';
  language: string;
  createdAt: string;
  ownerNickname: string;
}

const MyPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const navigate = useNavigate();
  const { user } = useUserStore();

  const handleLogout = () => {
    logout(navigate);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRooms = rooms.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rooms.length / itemsPerPage);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get<Room[]>('/users/me/sessions');
        setRooms(res.data);
      } catch (error) {
        console.error('방 목록 조회 실패', error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* 프로필 */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src={`https://api.dicebear.com/9.x/identicon/svg?seed=${user?.nickname}`}
              alt="프로필 사진"
              className="w-12 h-12 rounded-full ml-2"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {user?.nickname || 'Code Together'}
              </h2>
            </div>
          </div>
          <Button
            text="로그아웃"
            color="primary"
            className="mr-4"
            onClick={handleLogout}
          />
        </div>

        {/* 참여한 방 목록 */}
        <div className="bg-white border border-gray-200 rounded-sm p-6 relative h-[570px]">
          <div className="flex gap-2 mb-6">
            <ListBulletIcon className="w-6 h-6 text-gray-800 mt-0.5" />
            <p className="text-lg font-bold text-gray-800">참여했던 방 목록</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {currentRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={() => setSelectedRoom(room)}
              />
            ))}
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {selectedRoom && (
        <LogModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default MyPage;
