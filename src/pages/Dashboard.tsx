
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import LoadingState from '@/components/common/LoadingState';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import AppLayout from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingState text="Carregando dashboard..." />;
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <MainDashboard />
    </AppLayout>
  );
};

export default Dashboard;
