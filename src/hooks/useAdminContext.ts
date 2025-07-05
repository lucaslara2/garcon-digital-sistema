
import { useState, useContext, createContext, ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface AdminContextType {
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  isAdminMode: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminContextProvider');
  }
  return context;
};

export const AdminContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const { userProfile } = useAuth();
  
  const isAdminMode = userProfile?.role === 'admin';

  return (
    <AdminContext.Provider value={{
      selectedRestaurantId,
      setSelectedRestaurantId,
      isAdminMode
    }}>
      {children}
    </AdminContext.Provider>
  );
};
