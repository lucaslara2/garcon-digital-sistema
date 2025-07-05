
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  ShoppingCart, 
  ChefHat, 
  Settings,
  ClipboardList,
  MessageSquare,
  QrCode,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Navbar = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/orders', icon: ClipboardList, label: 'Pedidos' },
    { path: '/pos', icon: ShoppingCart, label: 'PDV' },
    { path: '/kitchen', icon: ChefHat, label: 'Cozinha' },
    { path: '/management', icon: Settings, label: 'Gestão' },
    { path: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  ];

  // Adicionar item Master para admin e staff
  if (userProfile?.role === 'admin' || userProfile?.role === 'staff') {
    menuItems.unshift({ path: '/master', icon: Shield, label: 'Master' });
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'restaurant_owner': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiter': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cashier': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'staff': return 'Staff de Suporte';
      case 'restaurant_owner': return 'Proprietário';
      case 'waiter': return 'Garçom';
      case 'cashier': return 'Caixa';
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">RestaurantOS</span>
            </Link>
          </div>

          {/* Menu de Navegação */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      item.path === '/master' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center space-x-4">
            {/* QR Code do Cardápio */}
            {userProfile?.role !== 'admin' && userProfile?.role !== 'staff' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Cardápio Digital</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4">
                    <div className="text-center">
                      {/* QR Code placeholder - em produção seria gerado dinamicamente */}
                      <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <QrCode className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Clientes podem escanear este QR Code para acessar o cardápio
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
                        {window.location.origin}/menu/{userProfile?.restaurant_id}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => {
                          const url = `${window.location.origin}/menu/${userProfile?.restaurant_id}`;
                          navigator.clipboard.writeText(url);
                        }}
                      >
                        Copiar Link
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{userProfile?.name}</div>
                    <Badge className={`text-xs ${getRoleColor(userProfile?.role || '')}`}>
                      {getRoleText(userProfile?.role || '')}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto px-4 py-2 space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col items-center h-auto py-2 px-3 text-xs ${
                    item.path === '/master' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
