
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Banknote, Smartphone, ArrowLeft, Check } from 'lucide-react';

interface PaymentFormProps {
  cart: any[];
  restaurant: any;
  onSuccess: (payment: any) => void;
  onBack: () => void;
}

export const PaymentForm = ({ cart, restaurant, onSuccess, onBack }: PaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [showPixCode, setShowPixCode] = useState(false);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = item.addons.reduce((sum: number, addon: any) => sum + (addon.price * addon.quantity), 0) * item.quantity;
      return total + itemTotal + addonsTotal;
    }, 0);
  };

  const getChangeAmount = () => {
    const total = getCartTotal();
    const paid = parseFloat(cashAmount) || 0;
    return Math.max(0, paid - total);
  };

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    if (paymentMethod === 'cash' && !cashAmount) {
      toast.error('Informe o valor em dinheiro');
      return;
    }

    if (paymentMethod === 'cash' && parseFloat(cashAmount) < getCartTotal()) {
      toast.error('Valor insuficiente');
      return;
    }

    setIsLoading(true);

    try {
      const clientId = localStorage.getItem('clientId');
      const addressId = localStorage.getItem('selectedAddressId');
      
      if (!clientId || !addressId) {
        throw new Error('Dados do cliente ou endereço não encontrados');
      }

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          client_id: clientId,
          customer_name: localStorage.getItem('clientName'),
          customer_phone: localStorage.getItem('clientPhone'),
          delivery_address: localStorage.getItem('selectedAddress'),
          order_type: 'delivery',
          subtotal: getCartTotal(),
          total: getCartTotal(),
          status: 'pending',
          delivery_instructions: `Forma de pagamento: ${
            paymentMethod === 'cash' ? `Dinheiro - R$ ${cashAmount} (Troco: R$ ${getChangeAmount().toFixed(2)})` :
            paymentMethod === 'card' ? 'Cartão na Entrega' :
            'PIX'
          }`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      for (const item of cart) {
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            notes: item.notes
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Criar adicionais do item
        for (const addon of item.addons) {
          await supabase
            .from('order_item_addons')
            .insert({
              order_item_id: orderItem.id,
              addon_id: addon.id,
              quantity: addon.quantity,
              unit_price: addon.price,
              total_price: addon.price * addon.quantity
            });
        }
      }

      // Criar registro de pagamento
      await supabase
        .from('payments')
        .insert({
          restaurant_id: restaurant.id,
          order_id: order.id,
          amount: getCartTotal(),
          payment_method: paymentMethod === 'cash' ? 'cash' : paymentMethod === 'card' ? 'credit_card' : 'pix',
          status: 'pending'
        });

      toast.success('Pedido realizado com sucesso!');
      
      // Limpar dados temporários
      localStorage.removeItem('clientId');
      localStorage.removeItem('selectedAddressId');
      localStorage.removeItem('clientName');
      localStorage.removeItem('clientPhone');
      localStorage.removeItem('selectedAddress');

      onSuccess({ orderId: order.id, paymentMethod });
    } catch (error: any) {
      toast.error('Erro ao processar pedido: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toFixed(2);
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
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Forma de Pagamento</CardTitle>
          <CardDescription>
            Total do pedido: <span className="font-bold text-green-600">R$ {getCartTotal().toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Escolha como pagar:</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                  <Banknote className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Dinheiro</div>
                    <div className="text-sm text-gray-600">Pagamento na entrega</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Cartão na Entrega</div>
                    <div className="text-sm text-gray-600">Débito ou crédito</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-gray-600">Pagamento imediato</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'cash' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Label htmlFor="cashAmount" className="text-sm font-medium text-yellow-800">
                Valor em dinheiro (para troco):
              </Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                min={getCartTotal()}
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder={`Mínimo: R$ ${getCartTotal().toFixed(2)}`}
                className="mt-2"
              />
              {cashAmount && parseFloat(cashAmount) >= getCartTotal() && (
                <div className="mt-2 text-sm">
                  <span className="text-green-700 font-medium">
                    Troco: R$ {getChangeAmount().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'pix' && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-3 text-purple-600" />
              <p className="text-sm text-purple-800 mb-3">
                Após confirmar o pedido, você receberá o código PIX para pagamento imediato.
              </p>
              <div className="bg-white p-4 rounded border text-xs text-gray-600">
                Valor: R$ {getCartTotal().toFixed(2)}
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmitOrder}
            disabled={isLoading || !paymentMethod}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Finalizar Pedido
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            Ao finalizar, você concorda com nossos termos de serviço
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
