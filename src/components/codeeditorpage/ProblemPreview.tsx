import type { TextareaHTMLAttributes } from 'react';

interface ProblemPreviewProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

export default function ProblemPreview({
  label = '문제 설명',
  textareaRef,
  className = '',
  ...props
}: ProblemPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-base font-semibold mb-2 text-black dark:text-white">
        {label}
      </div>
      <textarea
        ref={textareaRef}
        className={`w-full h-full resize-none bg-white dark:bg-gray-900 text-black dark:text-white p-4 border border-gray-300 dark:border-gray-700 rounded ${className}`}
        {...props}
      />
    </div>
  );
}
