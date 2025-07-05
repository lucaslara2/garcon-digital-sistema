
import React from 'react';
import { Navbar } from './Navbar';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <OfflineIndicator />
      <main 
        className="flex-1"
        role="main"
        aria-label="Conteúdo principal"
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
