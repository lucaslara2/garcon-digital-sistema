
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      bgColor: "bg-blue-50"
    },
    {
      title: "Produtos Ativos",
      value: activeProducts,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Estoque Baixo",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Preço Médio",
      value: `R$ ${averagePrice.toFixed(2)}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Categorias",
      value: totalCategories,
      icon: Grid3X3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Mais Caro",
      value: `R$ ${mostExpensive.toFixed(2)}`,
      icon: Star,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-gray-900 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
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
