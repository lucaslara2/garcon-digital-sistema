
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MainDashboard } from '@/components/dashboard/MainDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import RestaurantOwnerDashboard from '@/components/dashboards/RestaurantOwnerDashboard';
import WaiterDashboard from '@/components/dashboards/WaiterDashboard';
import CashierDashboard from '@/components/dashboards/CashierDashboard';

const Dashboard = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  // Todos os usuários agora veem o dashboard principal de controle do restaurante
  return <MainDashboard />;
};

export default Dashboard;
