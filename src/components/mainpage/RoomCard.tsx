import React from 'react';
import Button from '../common/Button';
import Label from '../common/Label';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  title: string;
  type?: string;
  id?: string;
  techStack: string;
  status: 'active' | 'inactive';
  category: string;
  className?: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  title,
  type,
  id,
  techStack,
  status,
  category,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-primary-100 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      {/* 카테고리 태그 */}
      <div className="flex justify-between items-start pb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
        </div>
        <Label
          variant={category === '문제풀이' ? 'green' : 'blue'}
          className="ml-2"
        >
          {category}
        </Label>
      </div>

      {/* 기술 스택 */}
      <div className="flex items-center mb-4">
        <span className="text-gray-600 text-sm font-medium">{techStack}</span>
      </div>

      {/* 상태 및 입장 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600 capitalize">
            {status === 'active' ? '활성' : '비활성'}
          </span>
        </div>
        {/* 데이터 받기 */}
        <Link to="/editor" state={{ roomId: id, type: type }}>
          <Button
            text="입장하기"
            color="primary"
            className="text-sm px-4 py-2"
          />
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
