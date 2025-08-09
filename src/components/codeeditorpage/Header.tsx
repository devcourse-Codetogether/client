import CodeTogetherLogo from '../../assets/code_together_logo.png';
import {
  MoonIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid';

interface HeaderProps {
  filename: string;
  isOwner: boolean;
  onToggleDarkMode: () => void;
  onSettingClick?: () => void;
  onLogoClick?: () => void;
}

export default function Header({
  filename,
  isOwner,
  onToggleDarkMode,
  onSettingClick,
  onLogoClick,
}: HeaderProps) {
  return (
    <header className="px-4 py-2 w-full dark:bg-gray-800 border-b-1 border-gray-200 dark:border-gray-600">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start gap-4 items-center">
          <img
            src={CodeTogetherLogo}
            width="91px"
            alt="logo"
            onClick={onLogoClick}
            className="cursor-pointer"
          />
          <div>{filename}</div>
        </div>
        <div className="flex flex-row justify-end gap-3 items-center">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
          >
            <MoonIcon className="w-5 h-5 text-sm text-gray-700 dark:text-gray-100" />
          </button>
          {isOwner && (
            <button
              className="p-2 rounded bg-error-600 hover:bg-error-700 hover:dark:bg-error-400 cursor-pointer"
              onClick={onSettingClick}
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-sm text-gray-100" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
