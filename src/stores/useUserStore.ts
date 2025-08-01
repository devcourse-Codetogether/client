import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nickname: string;
}

interface UserState {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      reset: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'user-storage', // localStorage에 저장될 key 이름
      partialize: (state) => ({
        // 저장할 값만 선택
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
