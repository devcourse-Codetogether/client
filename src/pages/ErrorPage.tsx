import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count === 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 rounded-lg shadow-lg bg-white max-w-sm w-full">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-2">페이지를 찾을 수 없습니다.</p>
        <p className="text-sm text-gray-500 mb-6">
          <span className="text-primary-500 font-semibold">{count}</span>초 뒤
          메인 페이지로 이동합니다.
        </p>
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          메인으로 이동
        </button>
      </div>
    </div>
  );
}
