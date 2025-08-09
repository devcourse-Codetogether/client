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
  onSendAIQuestion?: () => void;
  onCodeReview?: () => void;
}

export default function ChatPanel({
  activePanel,
  chatMessages,
  aiMessages,
  inputRef,
  onSendChat,
  onSendAIQuestion,
  onCodeReview,
}: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col min-h-0 overflow-hidden text-sm text-gray-800 dark:text-gray-100">
      {/* 스크롤은 이 영역에만 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 pt-4">
        {activePanel === 'chat' &&
          (chatMessages.length ? (
            chatMessages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                nickname={msg.nickname}
                time={msg.time}
                content={msg.content}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-300 text-center mt-4">
              아직 채팅이 없습니다.
            </div>
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

      {/* chat footer */}
      {activePanel === 'chat' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="메시지를 입력하세요"
            className="flex-1 h-10 px-4 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSendChat?.();
            }}
          />
          <Button
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            color="primary"
            className="h-10 leading-none px-3"
            onClick={onSendChat}
          />
        </div>
      )}

      {/* ai footer */}
      {activePanel === 'ai' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
          <Button
            text="코드 리뷰"
            color="secondary"
            className="flex w-full h-10 items-center justify-center leading-none text-xs px-3"
            onClick={onCodeReview}
          />
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="질문을 입력하세요"
              className="flex-1 h-10 px-4 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSendAIQuestion?.();
              }}
            />
            <Button
              icon={<PaperAirplaneIcon className="w-4 h-4" />}
              color="secondary"
              className="h-10 leading-none px-3"
              onClick={onSendAIQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}
