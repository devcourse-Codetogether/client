import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>기본화면입니다....</div>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
