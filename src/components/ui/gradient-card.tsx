
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  gradient?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const gradientVariants = {
  default: 'bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-slate-700/50 hover:border-amber-500/50',
  success: 'bg-gradient-to-br from-emerald-800/70 to-emerald-900/70 border-emerald-700/50 hover:border-emerald-500/50',
  warning: 'bg-gradient-to-br from-amber-800/70 to-amber-900/70 border-amber-700/50 hover:border-amber-500/50',
  danger: 'bg-gradient-to-br from-red-800/70 to-red-900/70 border-red-700/50 hover:border-red-500/50'
};

export function GradientCard({ 
  title, 
  description, 
  children, 
  className, 
  gradient = 'default',
  icon 
}: GradientCardProps) {
  return (
    <Card className={cn(
      'backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in',
      gradientVariants[gradient],
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-amber-500">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            {description && (
              <CardDescription className="text-slate-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
