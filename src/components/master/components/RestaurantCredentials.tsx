
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Mail, User, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RestaurantCredentialsProps {
  loginInfo: any;
  restaurant: any;
}

const RestaurantCredentials: React.FC<RestaurantCredentialsProps> = ({ loginInfo, restaurant }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Ver Credenciais
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Credenciais de Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>E-mail de Login</Label>
            <Input
              value={loginInfo?.email || restaurant.email || 'Não configurado'}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label>Senha Padrão</Label>
            <Input
              value="temp123456"
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Informações de Acesso</p>
              <p className="text-blue-700">
                Use essas credenciais para acessar o sistema como este restaurante.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantCredentials;
