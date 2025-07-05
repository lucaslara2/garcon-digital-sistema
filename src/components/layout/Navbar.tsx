
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Store, 
  ChefHat, 
  CreditCard, 
  BarChart3, 
  Settings,
  Home,
  LogOut,
  User
} from 'lucide-react';

export function Navbar() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'kitchen',
      label: 'Cozinha',
      icon: ChefHat,
      path: '/kitchen'
    },
    {
      id: 'pos',
      label: 'PDV',
      icon: CreditCard,
      path: '/pos'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports'
    },
    {
      id: 'restaurant-management',
      label: 'Configurações',
      icon: Settings,
      path: '/restaurant-management'
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Sistema Restaurante
              </h1>
              <div className="text-xs text-gray-500 flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{userProfile?.name}</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-2"></div>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="relative px-3 py-2 text-sm rounded-md transition-colors h-9"
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {userProfile?.role === 'restaurant_owner' ? 'Proprietário' : 'Funcionário'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
