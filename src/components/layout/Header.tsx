import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/code_together_logo.png';
import { useUserStore } from '../../stores/useUserStore';
import Button from '../common/Button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isLoggedIn = !!user;

  return (
    <header className="bg-white border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="CodeTogether" className="h-8 w-auto" />
          </div>

          {/* 오른쪽 아이콘들 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                onClick={() => navigate('/mypage')}
              >
                <UserCircleIcon className="h-6 w-6" />
              </button>
            ) : (
              <Button
                text="로그인"
                color="primary"
                onClick={() => navigate('/login')}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
