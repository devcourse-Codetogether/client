import CodeTogetherLogo from '../../assets/code_together_logo.png';
import { MoonIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  filename: string;
  isOwner: boolean;
  onToggleDarkMode: () => void;
  onSettingClick?: () => void;
}

export default function Header({
  filename,
  isOwner,
  onToggleDarkMode,
  onSettingClick,
}: HeaderProps) {
  return (
    <header className="px-4 py-2 w-screen dark:bg-gray-800">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start gap-4 items-center">
          <img src={CodeTogetherLogo} width="91px" alt="logo" />
          <div>{filename}</div>
        </div>
        <div className="flex flex-row justify-end gap-3 items-center">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
          >
            <MoonIcon className="w-5 h-5 text-sm text-gray-700 dark:text-gray-100" />
          </button>
          {isOwner && (
            <button
              className="p-2 rounded bg-gray-200 dark:bg-gray-700"
              onClick={onSettingClick}
            >
              <Cog6ToothIcon className="w-5 h-5 text-sm text-gray-700 dark:text-gray-100" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
