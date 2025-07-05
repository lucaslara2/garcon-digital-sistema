
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign, Receipt, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface PaymentSectionProps {
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  amountPaid: string;
  setAmountPaid: (amount: string) => void;
  change: number;
  onProcessOrder: () => void;
  isProcessing: boolean;
}

export function PaymentSection({
  subtotal,
  total,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  change,
  onProcessOrder,
  isProcessing
}: PaymentSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <div className="bg-green-600 p-2 rounded-lg mr-3">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          Finalizar Pagamento
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total a Pagar:</span>
            <span className="text-xl font-bold text-blue-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-gray-700 text-sm font-medium mb-2 block">
            Método de Pagamento
          </Label>
          <div className="space-y-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className="w-full justify-start h-9 text-sm"
              size="sm"
            >
              <Banknote className="h-4 w-4 mr-2" />
              Dinheiro
              {paymentMethod === 'cash' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('credit_card')}
              className="w-full justify-start h-9 text-sm"
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
              {paymentMethod === 'credit_card' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'pix' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('pix')}
              className="w-full justify-start h-9 text-sm"
              size="sm"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              PIX
              {paymentMethod === 'pix' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
          </div>
        </div>

        {/* Cash Payment Fields */}
        {paymentMethod === 'cash' && (
          <div className="space-y-3">
            <div>
              <Label className="text-gray-700 text-sm font-medium mb-1 block">
                Valor Recebido
              </Label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>
            
            {amountPaid && parseFloat(amountPaid) >= total && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Troco:</span>
                  <span className="text-lg font-bold text-green-800">R$ {change.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Process Order Button */}
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 text-sm"
          onClick={onProcessOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Processando...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Finalizar Pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
