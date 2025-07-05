
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        variant="destructive" 
        className="px-3 py-2 flex items-center space-x-2 shadow-lg animate-pulse"
        role="status"
        aria-live="polite"
        aria-label="Status da conexão"
      >
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        <span>Você está offline</span>
      </Badge>
    </div>
  );
};
