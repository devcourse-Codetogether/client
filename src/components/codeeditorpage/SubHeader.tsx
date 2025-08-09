import {
  PlayIcon,
  EyeIcon,
  CodeBracketIcon,
  BookOpenIcon,
} from '@heroicons/react/24/solid';
import Button from '../common/Button';

interface SubHeaderProps {
  mode: 'problem' | 'web';
  showPreview: boolean;
  onTogglePreview: () => void;
  onRunCode: () => void;
}

export default function SubHeader({
  mode,
  showPreview,
  onTogglePreview,
  onRunCode,
}: SubHeaderProps) {
  return (
    <div className="py-3 px-3 flex flex-row items-center gap-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {mode === 'web' && (
        <div className="flex flex-row gap-2">
          <Button
            icon={
              showPreview ? (
                <CodeBracketIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )
            }
            text={showPreview ? '코드만 보기' : '미리보기'}
            color={'primary'}
            className="px-3 py-1 text-sm dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onClick={onTogglePreview}
          />
        </div>
      )}
      {mode === 'problem' && (
        <Button
          icon={<PlayIcon className="w-4 h-4" />}
          text="실행"
          color="success"
          className="px-4 py-1 text-sm"
          onClick={onRunCode}
        />
      )}
    </div>
  );
}
