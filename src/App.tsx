import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const ColorTest = () => (
  <div className="p-4 space-y-4">
    <h2 className="text-2xl font-bold mb-2">Tailwind 색상 팔레트 테스트</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <div className="bg-primary-500 text-white p-4 rounded">primary-500</div>
      <div className="bg-secondary-500 text-white p-4 rounded">
        secondary-500
      </div>
      <div className="bg-success-500 text-white p-4 rounded">success-500</div>
      <div className="bg-error-500 text-white p-4 rounded">error-500</div>
      <div className="bg-gray-700 text-white p-4 rounded">gray-700</div>
      <div className="bg-kakao text-black p-4 rounded">kakao</div>
    </div>
    <div className="mt-4 grid grid-cols-5 gap-2">
      <div className="bg-primary-100 p-2 text-xs">primary-100</div>
      <div className="bg-primary-300 p-2 text-xs">primary-300</div>
      <div className="bg-primary-500 p-2 text-xs text-white">primary-500</div>
      <div className="bg-primary-700 p-2 text-xs text-white">primary-700</div>
      <div className="bg-primary-900 p-2 text-xs text-white">primary-900</div>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <ColorTest />, // 색상 테스트 컴포넌트로 교체
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
