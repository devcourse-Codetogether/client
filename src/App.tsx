import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ModalTestPage from './pages/ModalTestPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
// import CodeEditorPage from './pages/CodeEditorPage';
import CodeEditorPage2 from './pages/CodeEditorPage2';
import CodeEditorPage3 from './pages/CodeEditorPage3';

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
  {
    path: '/editor',
    element: <CodeEditorPage3 />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
