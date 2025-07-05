import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Tag, Percent, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import RestaurantSelector from '@/components/admin/RestaurantSelector';

interface CreatePromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: any[];
}

const CreatePromotionModal = ({ open, onOpenChange, products }: CreatePromotionModalProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const effectiveRestaurantId = isAdmin ? selectedRestaurantId : userProfile?.restaurant_id;

  const createPromotionMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!effectiveRestaurantId) {
        throw new Error('Restaurante deve ser selecionado');
      }

      let bannerUrl = null;
      
      // Upload banner se existir
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('promotion-banners')
          .upload(fileName, bannerFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('promotion-banners')
          .getPublicUrl(fileName);
        
        bannerUrl = publicUrl;
      }

      const promotionData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        discount_type: discountType,
        discount_value: parseFloat(formData.get('discount_value') as string),
        promotional_price: formData.get('promotional_price') ? parseFloat(formData.get('promotional_price') as string) : null,
        starts_at: startDate?.toISOString(),
        ends_at: endDate?.toISOString(),
        banner_url: bannerUrl,
        coupon_code: formData.get('coupon_code') as string || null,
        restaurant_id: effectiveRestaurantId,
        is_active: true
      };

      const { data: promotion, error } = await supabase
        .from('product_promotions')
        .insert(promotionData)
        .select()
        .single();
      
      if (error) throw error;

      // Associar produtos à promoção
      if (selectedProducts.length > 0) {
        const productAssignments = selectedProducts.map(productId => ({
          promotion_id: promotion.id,
          product_id: productId
        }));

        const { error: assignError } = await supabase
          .from('promotion_products')
          .insert(productAssignments);
        
        if (assignError) throw assignError;
      }

      return promotion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      onOpenChange(false);
      setSelectedProducts([]);
      setBannerFile(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedRestaurantId(null);
      toast.success('Promoção criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar promoção: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isAdmin && !selectedRestaurantId) {
      toast.error('Por favor, selecione um restaurante');
      return;
    }

    const formData = new FormData(e.currentTarget);
    createPromotionMutation.mutate(formData);
  };

  const calculateProfit = (price: number, cost: number, promotionalPrice?: number) => {
    const finalPrice = promotionalPrice || price;
    const profit = finalPrice - cost;
    const margin = cost > 0 ? ((profit / finalPrice) * 100) : 0;
    return { profit, margin };
  };

  const getSelectedProductsData = () => {
    return (products || []).filter(p => selectedProducts.includes(p.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white border-gray-200 animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center">
            <div className="bg-red-600 p-3 rounded-xl mr-3 shadow-sm">
              <Tag className="h-5 w-5 text-white" />
            </div>
            Criar Nova Promoção
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isAdmin && (
            <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
              <Label className="text-gray-700 font-medium">Restaurante</Label>
              <div className="mt-1">
                <RestaurantSelector
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantChange={setSelectedRestaurantId}
                  placeholder="Selecione o restaurante"
                />
              </div>
            </div>
          )}

          {/* Dados Básicos */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="name" className="text-gray-700 font-medium">Nome da Promoção</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="Ex: Combo Pizza + Refrigerante"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="Descreva a promoção..."
                  rows={3}
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Label className="text-gray-700 font-medium">Tipo de Desconto</Label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed_amount')}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 animate-scale-in">
                    <SelectItem value="percentage" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-900">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-2" />
                        Porcentagem
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount" className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Valor Fixo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <Label htmlFor="discount_value" className="text-gray-700 font-medium">
                    {discountType === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'}
                  </Label>
                  <Input
                    id="discount_value"
                    name="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                    placeholder={discountType === 'percentage' ? '10' : '5.00'}
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <Label htmlFor="promotional_price" className="text-gray-700 font-medium">Preço Promocional (R$)</Label>
                  <Input
                    id="promotional_price"
                    name="promotional_price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                    placeholder="25.90"
                  />
                </div>
              </div>
            </div>

            {/* Período e Banner */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <Label className="text-gray-700 font-medium">Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <Label className="text-gray-700 font-medium">Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                <Label className="text-gray-700 font-medium">Banner da Promoção</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="banner-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload do banner</span>
                        <input
                          id="banner-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                    {bannerFile && (
                      <p className="text-sm text-green-600 font-medium">{bannerFile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Label htmlFor="coupon_code" className="text-gray-700 font-medium">Código do Cupom (Opcional)</Label>
                <Input
                  id="coupon_code"
                  name="coupon_code"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="PIZZA20"
                />
              </div>
            </div>
          </div>

          {/* Seleção de Produtos */}
          <div className="border-t border-gray-200 pt-6 animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <Label className="text-gray-900 font-semibold text-lg mb-4 block">Produtos da Promoção</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {(products || []).map((product) => (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (selectedProducts.includes(product.id)) {
                      setSelectedProducts(prev => prev.filter(id => id !== product.id));
                    } else {
                      setSelectedProducts(prev => [...prev, product.id]);
                    }
                  }}
                >
                  <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">Custo: R$ {(product.cost_price || 0).toFixed(2)}</p>
                    <p className="text-xs text-green-600 font-medium">Venda: R$ {product.price.toFixed(2)}</p>
                    {product.cost_price > 0 && (
                      <p className="text-xs text-blue-600">
                        Margem: {(((product.price - product.cost_price) / product.price) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Lucro */}
          {selectedProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h4 className="text-gray-900 font-semibold text-lg mb-4">Análise de Lucro</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getSelectedProductsData().map((product) => {
                  const { profit, margin } = calculateProfit(product.price, product.cost_price || 0);
                  return (
                    <div key={product.id} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 text-sm">{product.name}</h5>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-green-600">Lucro: R$ {profit.toFixed(2)}</p>
                        <p className="text-xs text-blue-600">Margem: {margin.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 animate-fade-in" style={{ animationDelay: '0.65s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              disabled={createPromotionMutation.isPending}
            >
              {createPromotionMutation.isPending ? 'Criando...' : 'Criar Promoção'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromotionModal;
