import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface NavigationButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onClick,
  disabled,
}) => {
  const icon =
    direction === 'prev' ? (
      <ChevronLeftIcon className="w-4 h-4" />
    ) : (
      <ChevronRightIcon className="w-4 h-4" />
    );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  );
};

export default NavigationButton;
