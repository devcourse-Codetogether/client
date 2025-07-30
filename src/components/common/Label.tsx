import React from 'react';

export type LabelVariant = 'blue' | 'green';

interface LabelProps {
  children: React.ReactNode;
  variant?: LabelVariant;
  className?: string;
}

const Label: React.FC<LabelProps> = ({
  children,
  variant = 'blue',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium';

  const variantClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <span className={combinedClasses}>{children}</span>;
};

export default Label;
