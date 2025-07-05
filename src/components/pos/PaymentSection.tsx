
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GradientCard } from '@/components/ui/gradient-card';
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
    <GradientCard 
      title="Finalizar Pagamento" 
      icon={<Receipt className="h-5 w-5" />}
      gradient="warning"
      className="animate-fade-in shadow-2xl border-amber-500/30"
    >
      <div className="space-y-6">
        {/* Resumo Financeiro Premium */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-slate-600/30 shadow-lg backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex justify-between text-slate-300">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
            </div>
            <Separator className="bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-white">Total a Pagar:</span>
              <span className="text-amber-400 text-xl">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento Premium */}
        <div>
          <Label className="text-slate-300 text-sm font-medium mb-4 block">
            Método de Pagamento
          </Label>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className={paymentMethod === 'cash' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg' 
                : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all'
              }
            >
              <Banknote className="h-4 w-4 mr-2" />
              Dinheiro
              {paymentMethod === 'cash' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('credit_card')}
              className={paymentMethod === 'credit_card' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg' 
                : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all'
              }
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
              {paymentMethod === 'credit_card' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'pix' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('pix')}
              className={paymentMethod === 'pix' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg' 
                : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-amber-500/50 transition-all'
              }
            >
              <Smartphone className="h-4 w-4 mr-2" />
              PIX
              {paymentMethod === 'pix' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
          </div>
        </div>

        {/* Campos para Dinheiro Premium */}
        {paymentMethod === 'cash' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="amount-paid" className="text-slate-300 text-sm font-medium mb-2 block">
                Valor Recebido
              </Label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  id="amount-paid"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-600/50 text-white placeholder-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20 shadow-lg"
                />
              </div>
            </div>
            
            {amountPaid && parseFloat(amountPaid) >= total && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30 shadow-lg animate-fade-in backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-300 font-medium">Troco:</span>
                    <p className="text-xs text-green-200/70">Para o cliente</p>
                  </div>
                  <span className="text-xl font-bold text-green-400">
                    R$ {change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão Finalizar Premium */}
        <Button
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 h-12 text-base group"
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
              <Receipt className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Finalizar Pedido
            </>
          )}
        </Button>
      </div>
    </GradientCard>
  );
}
