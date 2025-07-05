
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const AdminReports: React.FC = () => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Relatórios do Sistema</CardTitle>
        <CardDescription className="text-slate-400">
          Análise geral do uso do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-slate-400 text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-500" />
          <p>Relatórios em desenvolvimento</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReports;
