
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  // Se for admin ou owner, mostra o dashboard principal primeiro
  if (userProfile.role === 'admin' || userProfile.role === 'restaurant_owner') {
    return <MainDashboard />;
  }

  // Para outros roles, mantém os dashboards específicos
  switch (userProfile.role) {
    case 'waiter':
      return <WaiterDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;
