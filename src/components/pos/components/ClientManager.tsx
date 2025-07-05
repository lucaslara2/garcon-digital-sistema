
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, MapPin, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  client_addresses: {
    id: string;
    address: string;
    label: string;
    is_default: boolean;
  }[];
}

interface ClientManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientManager({ isOpen, onClose }: ClientManagerProps) {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Buscar clientes
  const { data: clients, isLoading } = useQuery({
    queryKey: ['pos-clients', userProfile?.restaurant_id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select(`
          *,
          client_addresses (
            id,
            address,
            label,
            is_default
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true)
        .order('name');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
    enabled: isOpen && !!userProfile?.restaurant_id
  });

  // Criar cliente
  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          restaurant_id: userProfile?.restaurant_id,
          username: clientData.phone,
          password_hash: 'temp_password_' + Date.now() // Em produção, usar hash seguro
        })
        .select()
        .single();

      if (error) throw error;

      // Criar endereço se fornecido
      if (clientData.address) {
        await supabase
          .from('client_addresses')
          .insert({
            client_id: data.id,
            address: clientData.address,
            label: 'Principal',
            is_default: true
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-clients'] });
      setNewClient({ name: '', phone: '', email: '', address: '' });
      setShowNewClientForm(false);
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar cliente: ' + error.message);
    }
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }
    createClientMutation.mutate(newClient);
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Gerenciar Clientes
            </DialogTitle>
            <Button
              onClick={() => setShowNewClientForm(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div>
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Formulário novo cliente */}
          {showNewClientForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Novo Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={newClient.address}
                        onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, número, bairro..."
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createClientMutation.isPending}>
                      {createClientMutation.isPending ? 'Criando...' : 'Criar Cliente'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewClientForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de clientes */}
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">Carregando clientes...</div>
            ) : clients?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum cliente encontrado
              </div>
            ) : (
              clients?.map(client => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{client.name}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {formatPhone(client.phone)}
                          </div>
                          {client.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {client.email}
                            </div>
                          )}
                        </div>
                        
                        {client.client_addresses?.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              Endereços:
                            </div>
                            <div className="space-y-1">
                              {client.client_addresses.map(address => (
                                <div key={address.id} className="flex items-center space-x-2">
                                  <Badge variant={address.is_default ? "default" : "secondary"} className="text-xs">
                                    {address.label}
                                  </Badge>
                                  <span className="text-sm text-gray-600">{address.address}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
