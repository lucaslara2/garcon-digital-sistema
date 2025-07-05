
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Erro", 
  message = "Algo deu errado. Tente novamente.",
  onRetry
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600 max-w-md">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
