import React, { useState } from 'react';
import {
  XMarkIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';

interface LogEntry {
  id: number;
  author: string;
  timestamp: string;
  language: string;
  content: string;
}

interface ChatEntry {
  id: number;
  author: string;
  timestamp: string;
  message: string;
}

interface LogModalProps {
  room: {
    id: number;
    title: string;
    createdAt: string;
    language: string;
    mode: string;
  };
  onClose: () => void;
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    author: '코딩마스터',
    timestamp: '2024-07-18 14:30:25',
    language: 'javascript',
    content: 'function App() {\n  return <div>Hello World</div>;\n}',
  },
  {
    id: 2,
    author: '개발자123',
    timestamp: '2024-07-18 14:32:10',
    language: 'javascript',
    content:
      '// 컴포넌트 최적화를 위해 useCallback 추가...\nconst memoizedFn = useCallback(() => {}, []);',
  },
];

const mockChats: ChatEntry[] = [
  {
    id: 1,
    author: '개발자123',
    timestamp: '2024-07-18 14:21:15',
    message: '안녕하세요! React 프로젝트를 같이 하게 되어 기쁩니다.',
  },
  {
    id: 2,
    author: '코딩마스터',
    timestamp: '2024-07-18 14:27:30',
    message: '환영합니다! 오늘은 간단한 카운터 앱을 만들어보겠습니다.',
  },
  {
    id: 3,
    author: '프론트엔드맨',
    timestamp: '2024-07-18 14:28:45',
    message: '기본 구조 잘 만드셨네요. 최적화 부분을 추가해보겠습니다.',
  },
  {
    id: 4,
    author: '개발자123',
    timestamp: '2024-07-18 14:33:20',
    message: 'useCallback 사용 좋은 아이디어네요!',
  },
  {
    id: 5,
    author: '프론트엔드맨',
    timestamp: '2024-07-18 14:36:00',
    message: '스타일링도 추가했습니다. 어떠신가요?',
  },
];

const LogModal: React.FC<LogModalProps> = ({ room, onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'chat'>('code');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-sm w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-b-primary-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {room.title}
            </h2>
            <p className="text-sm text-gray-500">{room.createdAt}</p>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-800 cursor-pointer" />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-b-primary-100 text-sm">
          <button
            className={`flex-1 py-2 font-medium text-center border-b-2 cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600 bg-primary-100/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('code')}
          >
            <CodeBracketIcon className="w-4 h-4" />
            코드 로그
          </button>

          <button
            className={`flex-1 py-2 text-center border-b-2 cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600 bg-primary-100/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            채팅 로그
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 h-[600px] overflow-y-auto space-y-4">
          {activeTab === 'code' ? (
            mockLogs.map((log) => (
              // 코드 로그
              <div
                key={log.id}
                className="rounded overflow-hidden border border-primary-100 ml-2 mr-2"
              >
                <div className="flex justify-between items-center bg-gray-50 px-4 py-2">
                  <div className="flex gap-2 text-sm text-gray-700">
                    <span className="font-semibold">{log.author}</span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {log.timestamp}
                    </span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                    {log.language}
                  </span>
                </div>
                <div className="bg-gray-900 p-4 text-white text-sm font-mono">
                  <pre className="whitespace-pre-wrap">{log.content}</pre>
                </div>
              </div>
            ))
          ) : (
            // 채팅 로그
            <div className="space-y-2 ml-2 mr-2">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded px-4 py-2 border border-primary-100 text-xs w-fit max-w-[75%]"
                >
                  <span className="text-gray-800 font-bold">{chat.author}</span>
                  <span className="text-gray-400 ml-2">{chat.timestamp}</span>
                  <p className="text-gray-700 mt-2">{chat.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
