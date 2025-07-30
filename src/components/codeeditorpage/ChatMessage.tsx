interface ChatMessageProps {
  nickname: string;
  time: string;
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  nickname,
  time,
  content,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-start gap-2 text-xs dark:text-gray-400 mb-1">
        <span className="text-gray-700 dark:text-gray-100">{nickname}</span>
        <span className="text-gray-500 dark:text-gray-300">{time}</span>
      </div>
      <div className="inline-block bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-4 py-2 rounded-md">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
