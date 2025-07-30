import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import Button from '../common/Button';
import ChatMessage from './ChatMessage';

interface Message {
  nickname: string;
  time: string;
  content: string;
}

interface ChatPanelProps {
  activePanel: 'chat' | 'ai';
  chatMessages: Message[];
  aiMessages: Message[];
  inputRef?: React.Ref<HTMLInputElement>;
  onSendChat?: () => void;
}

export default function ChatPanel({
  activePanel,
  chatMessages,
  aiMessages,
  inputRef,
  onSendChat,
}: ChatPanelProps) {
  return (
    <div className="flex-1 p-4 h-full overflow-y-auto text-sm text-gray-800 dark:text-gray-100 flex flex-col justify-between">
      <div>
        {activePanel === 'chat' &&
          chatMessages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              nickname={msg.nickname}
              time={msg.time}
              content={msg.content}
            />
          ))}
        {activePanel === 'ai' &&
          aiMessages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              nickname={msg.nickname}
              time={msg.time}
              content={msg.content}
            />
          ))}
      </div>

      {activePanel === 'chat' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSendChat?.();
            }}
          />
          <Button
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            color="primary"
            className="px-3 py-2 h-full"
            onClick={onSendChat}
          />
        </div>
      )}

      {activePanel === 'ai' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
          <Button
            text="코드 리뷰"
            color="secondary"
            className="text-xs text-center px-3 py-1 w-full"
            onClick={onSendChat}
          />
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="질문을 입력하세요"
              className="flex-1 px-4 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSendChat?.();
              }}
            />
            <Button
              icon={<PaperAirplaneIcon className="w-4 h-4" />}
              color="secondary"
              className="px-3 py-2"
              onClick={onSendChat}
            />
          </div>
        </div>
      )}
    </div>
  );
}
