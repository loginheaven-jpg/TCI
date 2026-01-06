import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  selected = false,
  onClick,
  padding = 'p-6',
  ...props
}) {
  const baseStyles = 'bg-white rounded-2xl shadow-sm border border-gray-100';
  const hoverStyles = hover ? 'hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer' : '';
  const selectedStyles = selected ? 'ring-2 ring-blue-500 border-blue-300' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${selectedStyles} ${padding} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-gray-100 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-bold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-gray-100 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
