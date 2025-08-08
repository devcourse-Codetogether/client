import React from 'react';

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

interface Props {
  log: CodeLog;
}

const CodeLogItem: React.FC<Props> = ({ log }) => {
  return (
    <div className="rounded overflow-hidden border border-primary-100 ml-2 mr-2">
      <div className="flex justify-between items-center bg-gray-50 px-4 py-2">
        <div className="flex gap-2 text-sm text-gray-700">
          <span className="font-semibold">{log.sender.nickname}</span>
          <span className="text-xs text-gray-400 mt-0.5">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
          {log.language}
        </span>
      </div>
      <div className="bg-gray-900 p-4 text-white text-sm font-mono">
        <pre className="whitespace-pre-wrap">{log.code}</pre>
      </div>
    </div>
  );
};

export default CodeLogItem;
