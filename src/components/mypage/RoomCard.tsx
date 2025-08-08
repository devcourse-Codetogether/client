import React from 'react';
import {
  CalendarIcon,
  CodeBracketIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

interface Room {
  id: number;
  title: string;
  mode: '문제풀이' | '웹편집';
  language: string;
  createdAt: string;
  ownerNickname: string;
}

interface RoomCardProps {
  room: Room;
  onClick: () => void; // 로그 모달 열기
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  return (
    <div className="bg-white border border-primary-100 p-6 hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-gray-800 mb-4">{room.title}</h4>
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
          onClick={onClick}
        >
          <p className="text-xs font-medium hover:font-bold">로그 보기</p>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
