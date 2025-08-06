import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

export const logout = async (navigate: (path: string) => void) => {
  try {
    const userStorage = localStorage.getItem('user-storage');
    if (!userStorage) {
      alert('이미 로그아웃된 상태입니다.');
      navigate('/login');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true },
    );

    useUserStore.getState().reset();
    localStorage.removeItem('user-storage');

    alert('로그아웃되었습니다.');
    navigate('/login');
  } catch (err) {
    console.error('로그아웃 요청 실패', err);
    alert('로그아웃에 실패했습니다.');
    navigate('/mypage');
  }
};
