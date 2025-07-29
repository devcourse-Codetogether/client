import React from 'react';
import { Link } from 'react-router-dom';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 주요 섹션들 */}
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* 왼쪽 섹션 - 브랜딩 및 소셜 미디어 */}
          <div className="space-y-4">
            <div>
              <img
                src="/src/assets/code_together_logo.png"
                alt="CodeTogether"
                className="h-8 w-auto mb-2"
              />
              <p className="text-gray-600 text-sm">
                개발자들이 함께 성장하는 실시간 협업 플랫폼
              </p>
            </div>
            <div className="flex space-x-4">
              {/* Code Repository */}
              <a
                href="https://github.com/devcourse-Codetogether"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <CodeBracketIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* 두 번째 칸 - 비어있음 */}
          <div></div>

          {/* 세 번째 칸 - 서비스 링크 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/create-room"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  방 만들기
                </Link>
              </li>
              <li>
                <Link
                  to="/find-room"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  방 찾기
                </Link>
              </li>
              <li>
                <Link
                  to="/mypage"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  마이페이지
                </Link>
              </li>
            </ul>
          </div>

          {/* 네 번째 칸 - 지원 링크 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">지원</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  도움말
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  to="/developer-guide"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  개발자 가이드
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 섹션 - 저작권 정보 */}
        <div className="border-t border-gray-200 mt-8">
          <p className="text-center text-gray-600 text-sm pt-8">
            © 2025 CodeTogether. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
