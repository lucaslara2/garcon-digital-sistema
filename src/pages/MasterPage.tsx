
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import EnhancedMasterDashboard from '@/components/master/EnhancedMasterDashboard';

const MasterPage = () => {
  const { userProfile, loading } = useAuth();

  console.log('MasterPage - Loading:', loading, 'UserProfile:', userProfile);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando painel master..." />
      </div>
    );
  }

  if (!userProfile) {
    console.log('No user profile - redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('User role:', userProfile.role);
  if (userProfile.role !== 'admin' && userProfile.role !== 'staff') {
    console.log('Access denied - role not admin or staff');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Access granted to enhanced master dashboard');
  return <EnhancedMasterDashboard />;
};

export default MasterPage;
