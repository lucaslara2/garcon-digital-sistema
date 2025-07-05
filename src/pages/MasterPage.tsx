
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import LoadingState from '@/components/common/LoadingState';
import MinimalMasterDashboard from '@/components/master/MinimalMasterDashboard';

const MasterPage = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingState text="Carregando painel master..." />;
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile.role !== 'admin' && userProfile.role !== 'staff') {
    return <Navigate to="/dashboard" replace />;
  }

  return <MinimalMasterDashboard />;
};

export default MasterPage;
