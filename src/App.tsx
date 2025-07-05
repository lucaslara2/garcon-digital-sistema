
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useState, useEffect, lazy, Suspense } from "react";
import LoadingState from "@/components/common/LoadingState";

// Lazy loading das páginas para melhor performance
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const POSPage = lazy(() => import("@/pages/POSPage"));
const KitchenPage = lazy(() => import("@/pages/KitchenPage"));
const RestaurantManagement = lazy(() => import("@/pages/RestaurantManagement"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Menu = lazy(() => import("@/pages/Menu"));
const DigitalMenu = lazy(() => import("@/pages/DigitalMenu"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Landing = lazy(() => import("@/pages/Landing"));
const MasterPage = lazy(() => import("@/pages/MasterPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ReportsView = lazy(() => import("@/components/analytics/ReportsView"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds
    const timer = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const PageFallback = () => (
    <LoadingState text="Carregando página..." size="md" />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <BrowserRouter>
            <div role="application" aria-label="Sistema RestaurantOS">
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/menu/:restaurantId" element={<DigitalMenu />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/master" element={
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <MasterPage />
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
                  <Route path="/products" element={
                    <ProtectedRoute allowedRoles={['restaurant_owner', 'admin']}>
                      <ProductsPage />
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
              </Suspense>
              <Toaster />
              {showInstallPrompt && (
                <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
              )}
            </div>
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
