
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import MasterDashboard from '@/components/master/MasterDashboard';

const MasterPage = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando painel master..." />
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile.role !== 'admin' && userProfile.role !== 'staff') {
    return <Navigate to="/dashboard" replace />;
  }

  return <MasterDashboard />;
};

export default MasterPage;
