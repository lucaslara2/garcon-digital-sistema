import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  QrCode,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TableStatus = Database['public']['Enums']['table_status'];

const TableManager = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [tableDialog, setTableDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);

  // Fetch tables
  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select(`
          *,
          orders(
            id,
            status,
            total,
            created_at
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('table_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Create/Update Table
  const tableMutation = useMutation({
    mutationFn: async (tableData: any) => {
      const { data, error } = editingTable
        ? await supabase
            .from('restaurant_tables')
            .update(tableData)
            .eq('id', editingTable.id)
            .select()
        : await supabase
            .from('restaurant_tables')
            .insert({ ...tableData, restaurant_id: userProfile?.restaurant_id })
            .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setTableDialog(false);
      setEditingTable(null);
      toast.success(editingTable ? 'Mesa atualizada!' : 'Mesa criada!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar mesa: ' + error.message);
    }
  });

  // Delete Table
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', tableId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Mesa excluída!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir mesa: ' + error.message);
    }
  });

  // Update Table Status
  const updateTableStatusMutation = useMutation({
    mutationFn: async ({ tableId, status }: { tableId: string; status: TableStatus }) => {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Status da mesa atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const handleTableSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tableData = {
      table_number: parseInt(formData.get('table_number') as string),
      seats: parseInt(formData.get('seats') as string),
      status: 'available' as TableStatus
    };

    tableMutation.mutate(tableData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  const generateQRCodeUrl = (tableId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${userProfile?.restaurant_id}?table=${tableId}`;
  };

  if (isLoading) {
    return <div className="p-6">Carregando mesas...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Mesas</h1>
          <p className="text-gray-600">Gerencie as mesas do seu restaurante</p>
        </div>
        
        <Dialog open={tableDialog} onOpenChange={setTableDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div>
                <Label htmlFor="table_number">Número da Mesa</Label>
                <Input
                  id="table_number"
                  name="table_number"
                  type="number"
                  min="1"
                  defaultValue={editingTable?.table_number}
                  required
                />
              </div>
              <div>
                <Label htmlFor="seats">Número de Lugares</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={editingTable?.seats || 4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTable ? 'Atualizar' : 'Criar'} Mesa
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables?.map((table) => {
          const activeOrder = table.orders?.find((order: any) => 
            ['pending', 'preparing', 'ready'].includes(order.status)
          );

          return (
            <Card key={table.id} className="relative">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className="flex justify-center items-center mb-2">
                    <MapPin className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold">Mesa {table.table_number}</h3>
                  <div className="flex justify-center items-center space-x-2 mt-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{table.seats} lugares</span>
                  </div>
                </div>

                <div className="flex justify-center mb-4">
                  <Badge className={`${getStatusColor(table.status)} text-white`}>
                    {getStatusText(table.status)}
                  </Badge>
                </div>

                {activeOrder && (
                  <div className="bg-yellow-50 p-2 rounded mb-4">
                    <p className="text-xs text-yellow-800">
                      Pedido ativo: R$ {activeOrder.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Status: {activeOrder.status}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => updateTableStatusMutation.mutate({
                        tableId: table.id,
                        status: table.status === 'available' ? 'occupied' : 'available'
                      })}
                    >
                      {table.status === 'available' ? 'Ocupar' : 'Liberar'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = generateQRCodeUrl(table.id);
                        navigator.clipboard.writeText(url);
                        toast.success('Link copiado!');
                      }}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingTable(table);
                        setTableDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTableMutation.mutate(table.id)}
                      disabled={table.status === 'occupied'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!tables || tables.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Nenhuma mesa cadastrada</h3>
            <p className="text-gray-600 mb-4">
              Comece criando sua primeira mesa para gerenciar o atendimento
            </p>
            <Button onClick={() => setTableDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira mesa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableManager;
