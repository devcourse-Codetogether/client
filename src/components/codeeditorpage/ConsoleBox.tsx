import { useRef, useState } from 'react';

export interface ConsoleBoxHandle {
  getInput: () => string;
  clearInput: () => void;
  appendLog: (line: string) => void;
}

interface ConsoleBoxProps {
  consoleRef: React.RefObject<ConsoleBoxHandle | null>;
}

export default function ConsoleBox({ consoleRef }: ConsoleBoxProps) {
  const [logs, setLogs] = useState<string[]>([
    '> Console initialized',
    '✔ Ready for commands',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 콘솔 API 정의
  const api: ConsoleBoxHandle = {
    getInput: () => inputRef.current?.value || '',
    clearInput: () => {
      if (inputRef.current) inputRef.current.value = '';
    },
    appendLog: (line: string) => {
      setLogs((prev) => [...prev, line]);
    },
  };

  // ref 객체가 존재하면 current에 API 연결
  if (consoleRef && 'current' in consoleRef) {
    consoleRef.current = api;
  }

  return (
    <div className="flex flex-col py-3 px-3 rounded-xs overflow-hidden">
      <div className="bg-gray-0 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-2 font-mono h-64 overflow-y-auto text-sm whitespace-pre-wrap">
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="bg-gray-0 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-2 font-mono"
        placeholder=">"
      />
    </div>
  );
}
