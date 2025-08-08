import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Label from '../common/Label';

interface RoomCardProps {
  title: string;
  type?: string;
  id?: string;
  techStack: string;
  category: string;
  className?: string;
  onJoin?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  title,
  techStack,
  category,
  className = '',
  onJoin,
}) => {
  return (
    <div
      className={`bg-white border border-primary-100 p-6 hover:shadow-md transition-shadow w-[380px] h-[160px] flex flex-col ${className}`}
    >
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

      <div className="flex-1"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CodeBracketIcon className="w-4 h-4 text-gray-900 mr-2" />
          <span className="text-gray-600 text-sm font-medium">{techStack}</span>
        </div>
        <Button
          text="입장하기"
          color="primary"
          className="text-sm px-4 py-2"
          onClick={onJoin}
        />
      </div>
    </div>
  );
};

export default RoomCard;
