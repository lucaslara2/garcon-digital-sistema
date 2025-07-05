
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Tag, Package } from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';

interface CategoriesGridProps {
  onEditCategory: (category: any) => void;
}

const CategoriesGrid = ({ onEditCategory }: CategoriesGridProps) => {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Carregando categorias...</h4>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhuma categoria criada</h4>
        <p className="text-gray-500">Organize seus produtos criando categorias</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <Card 
          key={category.id} 
          className="bg-white border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500">Ordem: {category.display_order}</p>
                  </div>
                </div>
                
                <Badge 
                  className={`text-xs ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {category.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm">{category.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {category.products?.length || 0} produtos
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditCategory(category)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoriesGrid;
