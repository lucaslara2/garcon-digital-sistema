
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Star,
  Grid3X3
} from 'lucide-react';

interface ProductStatsProps {
  products: any[];
  categories: any[];
}

const ProductStats = ({ products, categories }: ProductStatsProps) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => 
    p.inventory?.[0]?.current_stock <= p.inventory?.[0]?.min_stock
  ).length;
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;
  const totalCategories = categories.length;
  const mostExpensive = products.length > 0 
    ? Math.max(...products.map(p => p.price)) 
    : 0;

  const stats = [
    {
      title: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Produtos Ativos",
      value: activeProducts,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Estoque Baixo",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      title: "Preço Médio",
      value: `R$ ${averagePrice.toFixed(2)}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    {
      title: "Categorias",
      value: totalCategories,
      icon: Grid3X3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Mais Caro",
      value: `R$ ${mostExpensive.toFixed(2)}`,
      icon: Star,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`bg-white border-gray-200 hover:shadow-lg hover:border-gray-300 transform hover:scale-105 transition-all duration-200 animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-gray-900 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.borderColor} border p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductStats;
