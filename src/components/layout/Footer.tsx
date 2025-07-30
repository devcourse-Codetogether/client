import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 주요 섹션들 */}
        <div className="grid grid-cols-1 md:grid-cols-2">
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
          <div>
            <p className="text-gray-600 text-sm text-right">
              프로그래머스 웹 풀스택 데브코스 4차 스프린트 망고시루팀
              사이드프로젝트
              <br />
              강예람, 권순호, 이정찬, 박수연, 정기영
              <br />
              25.07.14 - 25.08.11
            </p>
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
