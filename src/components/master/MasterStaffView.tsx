
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import StaffManagement from './StaffManagement';

const MasterStaffView = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StaffManagement />
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterStaffView;
