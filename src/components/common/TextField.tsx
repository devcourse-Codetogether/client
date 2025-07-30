import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLInputElement>;
}

export default function TextField({
  label,
  icon,
  id,
  className = '',
  ref,
  ...props
}: TextFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center w-full border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 ${className}`}
      >
        {icon && <div className="mr-2 text-gray-400">{icon}</div>}
        <input
          id={id}
          ref={ref}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          {...props}
        />
      </div>
    </div>
  );
}
