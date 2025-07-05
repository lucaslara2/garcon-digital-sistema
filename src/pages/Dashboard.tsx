
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import RestaurantOwnerDashboard from '@/components/dashboards/RestaurantOwnerDashboard';
import WaiterDashboard from '@/components/dashboards/WaiterDashboard';
import CashierDashboard from '@/components/dashboards/CashierDashboard';

const Dashboard = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  switch (userProfile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'restaurant_owner':
      return <RestaurantOwnerDashboard />;
    case 'waiter':
      return <WaiterDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;
