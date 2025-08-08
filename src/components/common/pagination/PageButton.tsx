import React from 'react';
import type { PageItem } from './paginationUtils';

interface PageButtonProps {
  page: PageItem;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PageButton: React.FC<PageButtonProps> = ({
  page,
  isActive,
  onClick,
  disabled = false,
}) => {
  if (page === '...') {
    return (
      <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-500">
        ...
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-primary-500 text-white border border-primary-500 cursor-default'
          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
      }`}
    >
      {page}
    </button>
  );
};

export default PageButton;
