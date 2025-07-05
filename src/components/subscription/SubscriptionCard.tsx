
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface SubscriptionCardProps {
  planType: 'basic' | 'premium' | 'enterprise';
  price: string;
  features: string[];
  isCurrentPlan?: boolean;
  onSelectPlan: () => void;
  loading?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  planType,
  price,
  features,
  isCurrentPlan,
  onSelectPlan,
  loading
}) => {
  const getIcon = () => {
    switch (planType) {
      case 'basic':
        return <Check className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getCardColor = () => {
    if (isCurrentPlan) return 'border-green-500 bg-green-50';
    switch (planType) {
      case 'premium':
        return 'border-blue-500';
      case 'enterprise':
        return 'border-purple-500';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <Card className={`relative ${getCardColor()}`}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
          Plano Atual
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getIcon()}
        </div>
        <CardTitle className="capitalize">{planType}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-sm text-gray-500">/mês</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelectPlan} 
          disabled={isCurrentPlan || loading}
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isCurrentPlan ? 'Plano Ativo' : loading ? 'Processando...' : 'Selecionar Plano'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
