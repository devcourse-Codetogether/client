import { type HTMLAttributes, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  placeholder: string;
  options: Option[];
  onOptionSelect?: (value: string) => void;
}

export default function Dropdown({
  placeholder,
  options,
  onOptionSelect,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onOptionSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full border rounded-md border-gray-300">
      <div
        className="flex items-center justify-between gap-2 px-4 py-3 rounded-md cursor-pointer w-full font-normal text-[16px] leading-[1.5]"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{placeholder}</span>
        <span>
          {isOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </span>{' '}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-full min-w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
