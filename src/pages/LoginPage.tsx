import CodeTogetherLogo from '../assets/code_together_logo.png';
import KakaoLoginLogo from '../assets/kakao_login_medium_wide.png';
import { CodeBracketIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

const LoginPage = () => {
  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-100/30 to-secondary-100/30">
      <img
        src={CodeTogetherLogo}
        alt="CodeTogether Logo"
        className="h-10 mb-4"
      />
      <div className="text-sm text-gray-700 mb-8">
        함께 성장하는 개발자 커뮤니티
      </div>

      <div className="bg-white p-8 rounded-sm shadow-lg text-center">
        <div className="text-lg font-bold mb-2">로그인</div>
        <p className="text-sm text-gray-500 mb-4">
          카카오 계정으로 간편하게 시작하세요
        </p>
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="cursor-pointer"
        >
          <img src={KakaoLoginLogo} alt="Kakao Login" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        처음이신가요?{' '}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={handleKakaoLogin}
        >
          회원가입은 로그인과 동시에 진행됩니다
        </span>
      </p>

      <div className="flex gap-2 text-xs text-gray-400 mt-2">
        <span className="cursor-pointer">이용약관</span>
        {' · '}
        <span className="cursor-pointer">개인정보처리방침</span>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <div className="border border-primary-100 bg-white p-4 mb-4 w-92 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CodeBracketIcon className="w-5 h-5 text-primary-500" />
            <p className="text-sm font-bold text-gray-800 m-0">실시간 코딩</p>
          </div>
          <p className="text-xs text-gray-500">
            동시에 코드를 작성하고 실행해보세요
          </p>
        </div>
        <div className="border border-primary-100 bg-white p-4 mb-4 w-92 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserGroupIcon className="w-5 h-5 text-secondary-500" />
            <p className="text-sm font-bold text-gray-800 m-0">팀 협업</p>
          </div>
          <p className="text-xs text-gray-500">
            함께 문제를 해결하며 성장하세요
          </p>
        </div>
      </div>

      <footer className="text-xs text-gray-400 mt-10">
        © 2025 CodeTogether. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
