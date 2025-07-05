
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 text-center relative', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-3xl"></div>
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-4">
          {icon && (
            <div className="text-amber-500 mr-4">
              {icon}
            </div>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-slate-400 text-lg mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
