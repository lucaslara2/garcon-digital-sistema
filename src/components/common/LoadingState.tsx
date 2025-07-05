
import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  text = "Carregando...", 
  size = "lg" 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size={size} text={text} />
    </div>
  );
};

export default LoadingState;
