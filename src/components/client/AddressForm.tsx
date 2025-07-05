
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';

interface AddressFormProps {
  onSuccess: (address: any) => void;
  onBack: () => void;
}

export const AddressForm = ({ onSuccess, onBack }: AddressFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zipCode: ''
  });

  // Buscar endereços salvos do cliente
  useEffect(() => {
    const fetchAddresses = async () => {
      const clientId = localStorage.getItem('clientId'); // ou de onde vier o ID do cliente
      if (!clientId) return;

      const { data, error } = await supabase
        .from('client_addresses')
        .select('*')
        .eq('client_id', clientId)
        .order('is_default', { ascending: false });

      if (!error && data) {
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddress = data.find(addr => addr.is_default) || data[0];
          setSelectedAddressId(defaultAddress.id);
        }
      }
    };

    fetchAddresses();
  }, []);

  const handleSelectAddress = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (selectedAddress) {
      onSuccess(selectedAddress);
    } else {
      toast.error('Selecione um endereço');
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const clientId = localStorage.getItem('clientId');
      if (!clientId) throw new Error('Cliente não encontrado');

      const fullAddress = `${newAddress.address}, ${newAddress.number}${newAddress.complement ? `, ${newAddress.complement}` : ''}, ${newAddress.neighborhood}, ${newAddress.city} - CEP: ${newAddress.zipCode}`;

      const { data, error } = await supabase
        .from('client_addresses')
        .insert({
          client_id: clientId,
          label: newAddress.label,
          address: fullAddress,
          is_default: addresses.length === 0 // Primeiro endereço é padrão
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Endereço salvo com sucesso!');
      onSuccess(data);
    } catch (error: any) {
      toast.error('Erro ao salvar endereço: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="max-w-md mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>
            Selecione um endereço salvo ou cadastre um novo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {addresses.length > 0 && !showNewAddressForm && (
            <>
              <div>
                <Label>Endereços Salvos</Label>
                <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um endereço" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map(address => (
                      <SelectItem key={address.id} value={address.id}>
                        <div>
                          <div className="font-medium">{address.label}</div>
                          <div className="text-sm text-gray-600">{address.address}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSelectAddress}
                  className="flex-1"
                  disabled={!selectedAddressId}
                >
                  Usar Este Endereço
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewAddressForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {(showNewAddressForm || addresses.length === 0) && (
            <form onSubmit={handleSaveNewAddress} className="space-y-4">
              <div>
                <Label htmlFor="label">Nome do Endereço</Label>
                <Input
                  id="label"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ex: Casa, Trabalho, Apartamento..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: formatZipCode(e.target.value) }))}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Rua/Avenida</Label>
                <Input
                  id="address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={newAddress.number}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={newAddress.complement}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, complement: e.target.value }))}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={newAddress.neighborhood}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
                </Button>
                {addresses.length > 0 && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
