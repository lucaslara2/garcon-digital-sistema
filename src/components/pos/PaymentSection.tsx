
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
    <div className="bg-slate-900 rounded-lg border border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-amber-400" />
          Finalizar Pagamento
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Resumo */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total a Pagar:</span>
            <span className="text-xl font-bold text-amber-400">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div>
          <Label className="text-slate-300 text-sm font-medium mb-3 block">
            Método de Pagamento
          </Label>
          <div className="space-y-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className={paymentMethod === 'cash' ? 'bg-amber-600 hover:bg-amber-700 w-full' : 'border-slate-700 text-slate-300 hover:bg-slate-800 w-full'}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Dinheiro
              {paymentMethod === 'cash' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('credit_card')}
              className={paymentMethod === 'credit_card' ? 'bg-amber-600 hover:bg-amber-700 w-full' : 'border-slate-700 text-slate-300 hover:bg-slate-800 w-full'}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
              {paymentMethod === 'credit_card' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'pix' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('pix')}
              className={paymentMethod === 'pix' ? 'bg-amber-600 hover:bg-amber-700 w-full' : 'border-slate-700 text-slate-300 hover:bg-slate-800 w-full'}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              PIX
              {paymentMethod === 'pix' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
          </div>
        </div>

        {/* Campos para Dinheiro */}
        {paymentMethod === 'cash' && (
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300 text-sm font-medium mb-2 block">
                Valor Recebido
              </Label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            
            {amountPaid && parseFloat(amountPaid) >= total && (
              <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Troco:</span>
                  <span className="text-lg font-bold text-green-400">R$ {change.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão Finalizar */}
        <Button
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-11"
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
