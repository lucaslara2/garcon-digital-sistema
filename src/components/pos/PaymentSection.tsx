
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GradientCard } from '@/components/ui/gradient-card';
import { CreditCard, DollarSign, Receipt, Smartphone } from 'lucide-react';
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
    <GradientCard 
      title="Pagamento" 
      icon={<CreditCard className="h-5 w-5" />}
      gradient="warning"
      className="animate-fade-in"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <Separator className="bg-slate-600" />
          <div className="flex justify-between font-bold text-lg text-white">
            <span>Total:</span>
            <span className="text-amber-400">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <Label className="text-slate-300 text-sm font-medium">Método de Pagamento</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('cash')}
              className={paymentMethod === 'cash' 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Dinheiro
            </Button>
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('credit_card')}
              className={paymentMethod === 'credit_card' 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão
            </Button>
            <Button
              variant={paymentMethod === 'pix' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('pix')}
              className={paymentMethod === 'pix' 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }
            >
              <Smartphone className="h-4 w-4 mr-2" />
              PIX
            </Button>
          </div>
        </div>

        {paymentMethod === 'cash' && (
          <div>
            <Label htmlFor="amount-paid" className="text-slate-300 text-sm font-medium">
              Valor Pago
            </Label>
            <Input
              id="amount-paid"
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0,00"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mt-1"
            />
            {amountPaid && (
              <div className="mt-2 p-2 bg-slate-700/50 rounded border border-slate-600/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Troco:</span>
                  <span className="font-bold text-amber-400">R$ {change.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
          size="lg"
          onClick={onProcessOrder}
          disabled={isProcessing}
        >
          <Receipt className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </div>
    </GradientCard>
  );
}
