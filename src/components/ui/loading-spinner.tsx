
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeVariants = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={cn(
        'animate-spin rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-500',
        sizeVariants[size],
        className
      )} />
      {text && (
        <p className="text-slate-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
}
