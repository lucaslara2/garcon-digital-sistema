
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Plus, Check, Clock, CreditCard, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 89,90',
    period: '/mês',
    features: [
      'Até 10 produtos',
      'POS básico',
      'Relatórios simples',
      'Suporte por email'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 149,90',
    period: '/mês',
    features: [
      'Produtos ilimitados',
      'POS completo',
      'Relatórios avançados',
      'Delivery integrado',
      'WhatsApp marketing',
      'Suporte prioritário'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 299,90',
    period: '/mês',
    features: [
      'Tudo do Premium',
      'Multi-lojas',
      'API personalizada',
      'Consultoria dedicada',
      'Implementação gratuita'
    ],
    popular: false
  }
];

const paymentMethods = [
  { id: 'credit_card', name: 'Cartão de Crédito', icon: CreditCard },
  { id: 'pix', name: 'PIX', icon: Zap },
  { id: 'boleto', name: 'Boleto Bancário', icon: DollarSign },
];

const RestaurantRegistrationModal = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    address: '',
    plan_type: '',
    payment_method: '',
    include_implementation: false,
    contact_name: '',
    notes: ''
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          cnpj: data.cnpj,
          address: data.address,
          plan_type: data.plan_type as any,
          status: 'pending'
        });

      if (restaurantError) throw restaurantError;

      // Criar ticket de implementação
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title: `Novo Restaurante: ${data.name}`,
          description: `
Novo restaurante cadastrado:
- Nome: ${data.name}
- Plano: ${data.plan_type}
- Forma de pagamento: ${data.payment_method}
- Implementação incluída: ${data.include_implementation ? 'Sim' : 'Não'}
- Contato: ${data.contact_name}
- Observações: ${data.notes || 'Nenhuma'}
          `,
          priority: 'high',
          category: 'implementation',
          status: 'open',
          user_id: userProfile?.id,
          restaurant_id: userProfile?.restaurant_id
        });

      if (ticketError) throw ticketError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['master-tickets'] });
      toast.success('Restaurante cadastrado com sucesso!');
      setOpen(false);
      setStep(1);
      setFormData({
        name: '',
        email: '',
        phone: '',
        cnpj: '',
        address: '',
        plan_type: '',
        payment_method: '',
        include_implementation: false,
        contact_name: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar restaurante: ' + error.message);
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceedToStep2 = formData.name && formData.email && formData.phone && formData.cnpj;
  const canProceedToStep3 = formData.plan_type;
  const canSubmit = formData.payment_method && formData.contact_name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Restaurante
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">
            Cadastro de Novo Restaurante - Etapa {step} de 3
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`h-1 w-16 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <div className={`h-1 w-16 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Restaurante *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome do restaurante"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Escolha o Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    formData.plan_type === plan.id 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'hover:border-gray-300'
                  } ${plan.popular ? 'relative' : ''}`}
                  onClick={() => handleInputChange('plan_type', plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">
                      {plan.price}
                      <span className="text-sm text-gray-600">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment and Implementation */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pagamento e Implementação</h3>
            
            {/* Payment Method */}
            <div>
              <Label className="text-base font-medium">Forma de Pagamento</Label>
              <div className="grid grid-cols-3 gap-4 mt-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        formData.payment_method === method.id 
                          ? 'ring-2 ring-blue-500 border-blue-500' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('payment_method', method.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">{method.name}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Implementation Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="implementation"
                checked={formData.include_implementation}
                onCheckedChange={(checked) => handleInputChange('include_implementation', checked as boolean)}
              />
              <Label htmlFor="implementation" className="text-sm">
                Incluir implementação personalizada (+R$ 199,90)
              </Label>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Nome do Contato *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            {/* Summary */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-base">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Restaurante:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium">
                      {plans.find(p => p.id === formData.plan_type)?.name} - {plans.find(p => p.id === formData.plan_type)?.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Forma de pagamento:</span>
                    <span className="font-medium">
                      {paymentMethods.find(p => p.id === formData.payment_method)?.name}
                    </span>
                  </div>
                  {formData.include_implementation && (
                    <div className="flex justify-between">
                      <span>Implementação:</span>
                      <span className="font-medium">+R$ 199,90</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Status:</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente Aprovação
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
              >
                Voltar
              </Button>
              <Button 
                onClick={() => createRestaurantMutation.mutate(formData)}
                disabled={!canSubmit || createRestaurantMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createRestaurantMutation.isPending ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantRegistrationModal;
