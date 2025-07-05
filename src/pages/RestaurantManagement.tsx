
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuManager from '@/components/menu/MenuManager';
import TableManager from '@/components/tables/TableManager';
import ReportsManager from '@/components/reports/ReportsManager';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import { 
  Utensils, 
  MapPin, 
  BarChart3, 
  QrCode,
  Settings 
} from 'lucide-react';

const RestaurantManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciamento do Restaurante</h1>
          <p className="text-gray-600">Sistema completo de gestão</p>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <Utensils className="h-4 w-4" />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>QR Codes</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuManager />
          </TabsContent>

          <TabsContent value="tables">
            <TableManager />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeGenerator />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsManager />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Configurações</h3>
              <p className="text-gray-600">
                Configurações avançadas em desenvolvimento...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantManagement;
