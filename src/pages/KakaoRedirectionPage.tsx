import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

const KakaoRedirectPage = () => {
  const navigate = useNavigate();

  const setAccessToken = useUserStore((state) => state.setAccessToken);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');

    if (code) {
      // 백엔드로 인가 코드 전달
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      axios
        .post(`${API_BASE_URL}/auth/kakao`, { code }, { withCredentials: true })
        .then((res) => {
          const { accessToken, user } = res.data;

          // zustand에 저장
          setAccessToken(accessToken);
          setUser(user);

          // localStorage에도 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));

          navigate('/');
        })
        .catch((err) => {
          console.error('카카오 로그인 실패', err);
          alert('카카오 로그인에 실패했습니다.');
          navigate('/login');
        });
    } else {
      alert('인가 코드가 없습니다.');
      navigate('/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-600 text-sm">
      로그인 중입니다. 잠시만 기다려주세요...
    </div>
  );
};

export default KakaoRedirectPage;
