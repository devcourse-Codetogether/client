import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import Button from '../common/Button';

interface PanelTabHeaderProps {
  activePanel: 'chat' | 'ai';
  onChange: (panel: 'chat' | 'ai') => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function PanelTabHeader({
  activePanel,
  onChange,
  onClose,
  isDarkMode,
}: PanelTabHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-2 py-2">
      <div className="flex flex-row gap-2">
        <Button
          icon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
          text="실시간 채팅"
          color={
            activePanel === 'chat' ? 'primary' : isDarkMode ? 'dark' : 'light'
          }
          onClick={() => onChange('chat')}
          className="text-sm"
        />
        <Button
          icon={<LightBulbIcon className="w-4 h-4" />}
          text="AI 도움말"
          color={
            activePanel === 'ai' ? 'secondary' : isDarkMode ? 'dark' : 'light'
          }
          onClick={() => onChange('ai')}
          className="text-sm"
        />
      </div>
      <ChevronRightIcon className="w-4 h-4 cursor-pointer" onClick={onClose} />
    </div>
  );
}
