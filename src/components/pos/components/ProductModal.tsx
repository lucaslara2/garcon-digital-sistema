
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface ProductAddon {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  product_addons?: ProductAddon[];
}

interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, addons: SelectedAddon[], notes: string, quantity: number) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const handleAddonChange = (addon: ProductAddon, checked: boolean) => {
    if (checked) {
      setSelectedAddons(prev => [...prev, {
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: 1
      }]);
    } else {
      setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
    }
  };

  const updateAddonQuantity = (addonId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setSelectedAddons(prev => prev.filter(a => a.id !== addonId));
    } else {
      setSelectedAddons(prev => prev.map(addon =>
        addon.id === addonId ? { ...addon, quantity: newQuantity } : addon
      ));
    }
  };

  const getTotalPrice = () => {
    const basePrice = product.price * quantity;
    const addonsPrice = selectedAddons.reduce((sum, addon) => 
      sum + (addon.price * addon.quantity), 0
    ) * quantity;
    return basePrice + addonsPrice;
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedAddons, notes, quantity);
    // Reset form
    setQuantity(1);
    setSelectedAddons([]);
    setNotes('');
    onClose();
  };

  const activeAddons = product.product_addons?.filter(addon => addon.is_active) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}

          {product.description && (
            <p className="text-gray-600 text-sm">{product.description}</p>
          )}

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="font-medium">Preço base:</span>
            <span className="text-lg font-bold text-blue-600">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          {/* Quantidade */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quantidade</Label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Adicionais */}
          {activeAddons.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Adicionais</Label>
              <div className="space-y-3">
                {activeAddons.map(addon => {
                  const selectedAddon = selectedAddons.find(a => a.id === addon.id);
                  const isSelected = !!selectedAddon;

                  return (
                    <div key={addon.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={addon.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleAddonChange(addon, !!checked)}
                          />
                          <Label htmlFor={addon.id} className="cursor-pointer">
                            {addon.name}
                          </Label>
                        </div>
                        <Badge variant="secondary">
                          + R$ {addon.price.toFixed(2)}
                        </Badge>
                      </div>

                      {isSelected && (
                        <div className="flex items-center space-x-2 ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAddonQuantity(addon.id, selectedAddon.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {selectedAddon.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAddonQuantity(addon.id, selectedAddon.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações especiais..."
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-green-600">
                R$ {getTotalPrice().toFixed(2)}
              </span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Inclui adicionais selecionados
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAddToCart} className="flex-1">
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
