import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <img
              src="/src/assets/code_together_logo.png"
              alt="CodeTogether"
              className="h-8 w-auto"
            />
          </div>

          {/* 오른쪽 아이콘들 */}
          <div className="flex items-center space-x-4">
            {/* 알림 아이콘 */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <BellIcon className="h-6 w-6" />
            </button>

            {/* 사용자 프로필 아이콘 */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <UserCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
