
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Grid3X3, Package } from 'lucide-react';

interface CategoriesGridProps {
  categories: any[];
}

const CategoriesGrid = ({ categories }: CategoriesGridProps) => {
  if (categories.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-12">
          <Grid3X3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-slate-400">Crie categorias para organizar seus produtos!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Categorias de Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-amber-600 text-white text-xs ml-2">
                    #{category.display_order}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Package className="h-4 w-4 mr-1" />
                    <span>Produtos</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-600 border-red-500 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesGrid;
