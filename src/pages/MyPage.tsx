import { useEffect, useState } from 'react';
import CodeTogetherLogo from '../assets/code_together_logo.png';
import {
  ListBulletIcon,
  UserIcon,
  CodeBracketIcon,
  CalendarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';
import LogModal from '../components/mypage/LogModal';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/logout';
import { useUserStore } from '../stores/useUserStore'; // Zustand store
import api from '../utils/api';

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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); // 모달 상태

  const navigate = useNavigate();
  const { user } = useUserStore();

  const handleLogout = () => {
    logout(navigate);
  };

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
              src={CodeTogetherLogo}
              alt="프로필 사진"
              className="w-16 h-16 rounded-full"
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
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <div className="flex gap-2 mb-6">
            <ListBulletIcon className="w-6 h-6 text-gray-800 mt-0.5" />
            <p className="text-lg font-bold text-gray-800">참여했던 방 목록</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-primary-100 p-6 hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-800 mb-4">
                  {room.title}
                </h4>
                <div className="flex gap-2 mb-1">
                  <CalendarIcon className="w-4 h-4 text-gray-800 mt-0.5" />
                  <p className="text-sm text-gray-500">
                    {new Date(room.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 mb-1">
                  <CodeBracketIcon className="w-4 h-4 text-gray-800 mt-0.5" />
                  <p className="text-sm text-gray-500">{room.language}</p>
                </div>
                <div className="flex gap-2 mb-1">
                  <UserIcon className="w-4 h-4 text-gray-800 mt-0.5" />
                  <p className="text-sm text-gray-500">{room.ownerNickname}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div
                    className={`text-xs font-bold rounded-full h-6 flex items-center justify-center ${
                      room.mode === '문제풀이'
                        ? 'text-green-600 bg-green-100 w-19'
                        : 'text-primary-600 bg-primary-100 w-16'
                    }`}
                  >
                    {room.mode}
                  </div>
                  <button
                    className="flex gap-1 mb-1 text-blue-600 cursor-pointer"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <p className="text-xs font-medium hover:font-bold">
                      로그 보기
                    </p>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedRoom && (
        <LogModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default MyPage;
