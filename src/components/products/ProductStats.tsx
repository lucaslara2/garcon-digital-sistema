
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
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Produtos Ativos",
      value: activeProducts,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Estoque Baixo",
      value: lowStockProducts,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Preço Médio",
      value: `R$ ${averagePrice.toFixed(2)}`,
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Categorias",
      value: totalCategories,
      icon: Grid3X3,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Mais Caro",
      value: `R$ ${mostExpensive.toFixed(2)}`,
      icon: Star,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
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
