// src/components/mypage/LogModal.tsx
import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import api from '../../utils/api';
import CodeLogItem from './CodeLogItem';
import ChatLogItem from './ChatLogItem';

interface CodeLog {
  id: number;
  sessionId: number;
  senderId: number;
  code: string;
  language: string;
  createdAt: string;
  sender: {
    nickname: string;
  };
}

interface ChatLog {
  id: number;
  sessionId: number;
  senderId: number;
  message: string;
  createdAt: string;
  sender: {
    id: number;
    nickname: string;
  };
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

const LogModal: React.FC<LogModalProps> = ({ room, onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'chat'>('code');
  const [codeLogs, setCodeLogs] = useState<CodeLog[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const [codeRes, chatRes] = await Promise.all([
          api.get(`/users/me/sessions/${room.id}/code`),
          api.get(`/users/me/sessions/${room.id}/chats`),
        ]);
        setCodeLogs(codeRes.data);
        setChatLogs(chatRes.data.reverse());
      } catch (err) {
        console.error('로그 가져오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [room.id]);

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
            <p className="text-sm text-gray-500">
              {new Date(room.createdAt).toISOString().slice(0, 10)}
            </p>
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
          {isLoading ? (
            <div className="text-center text-gray-500 mt-10">
              불러오는 중...
            </div>
          ) : activeTab === 'code' ? (
            codeLogs.length > 0 ? (
              codeLogs.map((log) => <CodeLogItem key={log.id} log={log} />)
            ) : (
              <div className="text-center text-gray-400">
                코드 로그가 없습니다.
              </div>
            )
          ) : chatLogs.length > 0 ? (
            <div className="space-y-2 ml-2 mr-2">
              {chatLogs.map((chat) => (
                <ChatLogItem key={chat.id} chat={chat} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              채팅 로그가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
