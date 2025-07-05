
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import POSPage from "@/pages/POSPage";
import KitchenPage from "@/pages/KitchenPage";
import RestaurantManagement from "@/pages/RestaurantManagement";
import Subscription from "@/pages/Subscription";
import Menu from "@/pages/Menu";
import DigitalMenu from "@/pages/DigitalMenu";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";
import { ReportsView } from "@/components/analytics/ReportsView";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds
    const timer = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/menu/:restaurantId" element={<DigitalMenu />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/pos" element={
                <ProtectedRoute allowedRoles={['cashier', 'restaurant_owner', 'admin']}>
                  <POSPage />
                </ProtectedRoute>
              } />
              <Route path="/kitchen" element={
                <ProtectedRoute allowedRoles={['kitchen', 'restaurant_owner', 'admin']}>
                  <KitchenPage />
                </ProtectedRoute>
              } />
              <Route path="/management" element={
                <ProtectedRoute allowedRoles={['restaurant_owner', 'admin']}>
                  <RestaurantManagement />
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } />
              <Route path="/menu-management" element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['restaurant_owner', 'admin']}>
                  <ReportsView />
                </ProtectedRoute>
              } />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
            <Toaster />
            {showInstallPrompt && (
              <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
            )}
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
