
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  Calendar, 
  Edit, 
  Trash2, 
  ImageIcon,
  DollarSign,
  Percent
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PromotionsList = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_promotions')
        .select(`
          *,
          promotion_products(
            product_id,
            products(name, price, cost_price)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const deletePromotionMutation = useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase
        .from('product_promotions')
        .delete()
        .eq('id', promotionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promoção excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir promoção: ' + error.message);
    }
  });

  const isPromotionActive = (promotion: any) => {
    const now = new Date();
    const startDate = new Date(promotion.starts_at);
    const endDate = new Date(promotion.ends_at);
    return now >= startDate && now <= endDate && promotion.is_active;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <div className="bg-red-600 p-3 rounded-xl mr-3 shadow-sm">
            <Tag className="h-5 w-5 text-white" />
          </div>
          Promoções Ativas
        </h3>
        <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
          {promotions.filter(isPromotionActive).length} ativas
        </Badge>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhuma promoção criada</h4>
          <p className="text-gray-500">Crie promoções para aumentar suas vendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promotion, index) => (
            <Card 
              key={promotion.id} 
              className={`bg-white border hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in ${
                isPromotionActive(promotion) 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{promotion.name}</h4>
                    {promotion.description && (
                      <p className="text-gray-600 text-sm mb-3">{promotion.description}</p>
                    )}
                  </div>
                  
                  {promotion.banner_url && (
                    <div className="w-16 h-16 ml-4 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={promotion.banner_url}
                        alt={promotion.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Informações do Desconto */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-red-600">
                      {promotion.discount_type === 'percentage' ? (
                        <>
                          <Percent className="h-4 w-4 mr-1" />
                          <span className="font-bold">{promotion.discount_value}%</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-bold">R$ {promotion.discount_value.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                    
                    {promotion.promotional_price && (
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-bold">R$ {promotion.promotional_price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Período */}
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(promotion.starts_at), 'dd/MM/yyyy')} - {format(new Date(promotion.ends_at), 'dd/MM/yyyy')}
                    </span>
                  </div>

                  {/* Cupom */}
                  {promotion.coupon_code && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Cupom: {promotion.coupon_code}
                    </Badge>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`text-xs ${
                        isPromotionActive(promotion)
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                      variant="secondary"
                    >
                      {isPromotionActive(promotion) ? 'Ativa' : 'Inativa'}
                    </Badge>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                        onClick={() => deletePromotionMutation.mutate(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Produtos da Promoção */}
                  {promotion.promotion_products?.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Produtos inclusos:</p>
                      <div className="flex flex-wrap gap-1">
                        {promotion.promotion_products.map((pp: any) => (
                          <Badge 
                            key={pp.product_id} 
                            variant="secondary" 
                            className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                          >
                            {pp.products?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionsList;
