import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { UserPlus, Users, Shield, HeadphonesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

const StaffManagement = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState<{
    name: string;
    email: string;
    role: 'staff' | 'admin';
  }>({
    name: '',
    email: '',
    role: 'staff'
  });

  // Buscar todos os usuários staff e admin
  const { data: staffUsers, isLoading } = useQuery({
    queryKey: ['staff-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          restaurant:restaurants(name, status)
        `)
        .in('role', ['admin', 'staff'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin'
  });

  // Buscar estatísticas de tickets por staff
  const { data: staffStats } = useQuery({
    queryKey: ['staff-ticket-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('resolved_by, status')
        .not('resolved_by', 'is', null);
      
      if (error) throw error;
      
      // Agrupar estatísticas por staff
      const statsMap = new Map();
      data.forEach(ticket => {
        const staffId = ticket.resolved_by;
        if (!statsMap.has(staffId)) {
          statsMap.set(staffId, { resolved: 0, closed: 0, total: 0 });
        }
        const stats = statsMap.get(staffId);
        stats.total++;
        if (ticket.status === 'resolved') stats.resolved++;
        if (ticket.status === 'closed') stats.closed++;
      });
      
      return Object.fromEntries(statsMap);
    },
    enabled: userProfile?.role === 'admin'
  });

  // Criar novo usuário staff
  const createStaffMutation = useMutation({
    mutationFn: async (staffData: typeof newStaffData) => {
      // Aqui normalmente você criaria o usuário via Auth, mas para demo vamos simular
      const { data, error } = await supabase.auth.signUp({
        email: staffData.email,
        password: 'temp123456', // Senha temporária
        options: {
          data: {
            name: staffData.name,
            role: staffData.role
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('Usuário staff criado com sucesso!');
      setIsDialogOpen(false);
      setNewStaffData({ name: '', email: '', role: 'staff' });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar usuário: ' + error.message);
    }
  });

  // Atualizar role do usuário
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('Role atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar role: ' + error.message);
    }
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'staff': return <HeadphonesIcon className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="text-center text-white">
        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-slate-400">Apenas administradores podem gerenciar staff.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Staff</h2>
          <p className="text-slate-400">Gerencie usuários administrativos e de suporte</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Usuário Staff</DialogTitle>
              <DialogDescription className="text-slate-400">
                Adicione um novo membro à equipe de suporte ou administração.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white">Nome</label>
                <Input
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({...newStaffData, name: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white">Email</label>
                <Input
                  type="email"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData({...newStaffData, email: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white">Role</label>
                <Select 
                  value={newStaffData.role} 
                  onValueChange={(value: 'staff' | 'admin') => setNewStaffData({...newStaffData, role: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="staff">Staff (Suporte)</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => createStaffMutation.mutate(newStaffData)}
                  disabled={!newStaffData.name || !newStaffData.email}
                  className="flex-1"
                >
                  Criar Usuário
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipe de Staff
          </CardTitle>
          <CardDescription className="text-slate-400">
            {staffUsers?.length || 0} membros na equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {staffUsers?.map((user) => {
                const stats = staffStats?.[user.id] || { resolved: 0, closed: 0, total: 0 };
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <div>
                          <h3 className="text-white font-medium">{user.name}</h3>
                          <p className="text-slate-400 text-sm">{user.id}</p>
                        </div>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'admin' ? 'Administrador' : 'Staff de Suporte'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {user.role === 'staff' && (
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Tickets Resolvidos</div>
                          <div className="text-lg font-bold text-green-400">
                            {stats.resolved + stats.closed}
                          </div>
                          <div className="text-xs text-slate-500">
                            {stats.total} total atendidos
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {user.role === 'staff' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRoleMutation.mutate({
                              userId: user.id,
                              role: 'admin' as UserRole
                            })}
                            className="border-slate-600 text-slate-300"
                          >
                            Promover a Admin
                          </Button>
                        )}
                        {user.role === 'admin' && user.id !== userProfile?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRoleMutation.mutate({
                              userId: user.id,
                              role: 'staff' as UserRole
                            })}
                            className="border-slate-600 text-slate-300"
                          >
                            Rebaixar a Staff
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;
