
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface InstallPromptProps {
  onDismiss: () => void;
}

export function InstallPrompt({ onDismiss }: InstallPromptProps) {
  const { installApp, isInstallable } = usePWA();

  if (!isInstallable) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Instalar App</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Instale o Garçom Digital para acesso rápido e offline
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button onClick={installApp} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Instalar Agora
        </Button>
      </CardContent>
    </Card>
  );
}
