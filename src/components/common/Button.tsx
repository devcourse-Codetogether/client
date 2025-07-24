import React from 'react';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'light'
  | 'dark'
  | 'kakao';

interface ButtonProps {
  icon?: React.ReactNode;
  text?: string;
  color?: ButtonColor;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const colorClassMap: Record<ButtonColor, string> = {
  primary: 'bg-primary-500 text-gray-0 hover:bg-primary-600',
  secondary: 'bg-secondary-500 text-gray-0 hover:bg-secondary-600',
  success: 'bg-success-500 text-gray-0 hover:bg-success-600',
  light: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  dark: 'bg-gray-700 text-gray-300 hover:bg-gray-800',
  kakao: 'bg-kakao text-gray-900 hover:brightness-95',
};

const Button: React.FC<ButtonProps> = ({
  icon,
  text,
  color = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-sm font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${colorClassMap[color]} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="text-lg flex items-center">{icon}</span>}
      {text && <span className="flex items-center">{text}</span>}
    </button>
  );
};

export default Button;
