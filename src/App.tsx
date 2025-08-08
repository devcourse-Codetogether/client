import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import KakaoRedirectPage from './pages/KakaoRedirectionPage';
import CodeEditorPage from './pages/CodeEditorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />, //
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/oauth/kakao/callback',
    element: <KakaoRedirectPage />,
  },
  {
    path: '/mypage',
    element: <MyPage />,
  },
  {
    path: '/editor/:sessionId',
    element: <CodeEditorPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
