
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Copy, Eye } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

const QRCodeGenerator = () => {
  const { userProfile } = useAuth();
  const [tableNumber, setTableNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQRCode = () => {
    if (!tableNumber.trim()) {
      toast.error('Digite o número da mesa');
      return;
    }

    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/menu/${userProfile?.restaurant_id}?table=${tableNumber}`;
    
    // Using a free QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
    
    setQrCodeUrl(qrApiUrl);
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `mesa-${tableNumber}-qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('QR Code baixado!');
    } catch (error) {
      toast.error('Erro ao baixar QR Code');
    }
  };

  const copyUrl = () => {
    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/menu/${userProfile?.restaurant_id}?table=${tableNumber}`;
    
    navigator.clipboard.writeText(menuUrl);
    toast.success('URL copiada!');
  };

  const previewMenu = () => {
    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/menu/${userProfile?.restaurant_id}?table=${tableNumber}`;
    
    window.open(menuUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-6 w-6" />
            Gerador de QR Code
          </CardTitle>
          <CardDescription>
            Gere QR codes para suas mesas para permitir pedidos pelo celular
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="table-number">Número da Mesa</Label>
            <div className="flex space-x-2">
              <Input
                id="table-number"
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Digite o número da mesa"
                className="flex-1"
              />
              <Button onClick={generateQRCode}>
                Gerar QR Code
              </Button>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code Mesa ${tableNumber}`}
                  className="mx-auto border rounded-lg"
                />
              </div>

              <div className="flex justify-center space-x-2">
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                
                <Button onClick={copyUrl} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </Button>
                
                <Button onClick={previewMenu} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Imprima o QR Code e cole na mesa {tableNumber}</li>
                  <li>2. Clientes escaneiam o código com a câmera do celular</li>
                  <li>3. Eles serão direcionados para o cardápio digital</li>
                  <li>4. Pedidos serão enviados diretamente para a cozinha</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
