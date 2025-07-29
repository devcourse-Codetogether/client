import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ModalTestPage from './pages/ModalTestPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />, //
  },
  {
    path: '/modal-test',
    element: <ModalTestPage />, // 모달창 테스트 페이지
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/mypage',
    element: <MyPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
