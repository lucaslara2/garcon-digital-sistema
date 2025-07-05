
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GradientCard } from '@/components/ui/gradient-card';
import { CreditCard, DollarSign, Receipt, Smartphone, Banknote } from 'lucide-react';
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
      title="Finalizar Pagamento" 
      icon={<Receipt className="h-5 w-5" />}
      gradient="warning"
      className="animate-fade-in"
    >
      <div className="space-y-6">
        {/* Resumo Financeiro */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-4 border border-slate-600/50">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <Separator className="bg-slate-600" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-white">Total:</span>
              <span className="text-amber-400">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div>
          <Label className="text-slate-300 text-sm font-medium mb-3 block">
            Método de Pagamento
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('cash')}
              className={paymentMethod === 'cash' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-amber-500/50'
              }
            >
              <Banknote className="h-4 w-4 mr-2" />
              Dinheiro
            </Button>
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('credit_card')}
              className={paymentMethod === 'credit_card' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-amber-500/50'
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
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0' 
                : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-amber-500/50'
              }
            >
              <Smartphone className="h-4 w-4 mr-2" />
              PIX
            </Button>
          </div>
        </div>

        {/* Campos para Dinheiro */}
        {paymentMethod === 'cash' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="amount-paid" className="text-slate-300 text-sm font-medium">
                Valor Recebido
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
            </div>
            {amountPaid && (
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-3 border border-green-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Troco:</span>
                  <span className="text-lg font-bold text-green-400">
                    R$ {change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão Finalizar */}
        <Button
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 h-12"
          size="lg"
          onClick={onProcessOrder}
          disabled={isProcessing}
        >
          <Receipt className="h-5 w-5 mr-2" />
          {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </div>
    </GradientCard>
  );
}
