
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
    <div className="card-gradient rounded-xl border modern-shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-primary" />
          Finalizar Pagamento
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Total */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Total a Pagar:</span>
            <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <Label className="text-foreground text-sm font-medium mb-3 block">
            Método de Pagamento
          </Label>
          <div className="space-y-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className={`w-full justify-start ${paymentMethod === 'cash' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Dinheiro
              {paymentMethod === 'cash' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'credit_card' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('credit_card')}
              className={`w-full justify-start ${paymentMethod === 'credit_card' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
              {paymentMethod === 'credit_card' && <CheckCircle className="h-4 w-4 ml-auto" />}
            </Button>
            
            <Button
              variant={paymentMethod === 'pix' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('pix')}
              className={`w-full justify-start ${paymentMethod === 'pix' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
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
              <Label className="text-foreground text-sm font-medium mb-2 block">
                Valor Recebido
              </Label>
              <div className="relative">
                <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 bg-background border-border focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            {amountPaid && parseFloat(amountPaid) >= total && (
              <div className="success-gradient rounded-lg p-3 border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Troco:</span>
                  <span className="text-lg font-bold text-white">R$ {change.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Process Order Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 modern-shadow"
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
