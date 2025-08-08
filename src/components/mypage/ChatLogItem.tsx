import React from 'react';

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

interface Props {
  chat: ChatLog;
}

const ChatLogItem: React.FC<Props> = ({ chat }) => {
  return (
    <div className="rounded px-4 py-2 border border-primary-100 text-xs w-fit max-w-[75%]">
      <span className="text-gray-800 font-bold">{chat.sender.nickname}</span>
      <span className="text-gray-400 ml-2">
        {new Date(chat.createdAt).toLocaleString()}
      </span>
      <p className="text-gray-700 mt-2">{chat.message}</p>
    </div>
  );
};

export default ChatLogItem;
