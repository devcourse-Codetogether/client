import { InputHTMLAttributes } from 'react';

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
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full border rounded-md px-3 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
