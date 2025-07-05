
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import POSPage from "./pages/POSPage";
import KitchenPage from "./pages/KitchenPage";
import RestaurantManagement from "./pages/RestaurantManagement";
import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import DigitalMenu from "./pages/DigitalMenu";
import OrdersManagement from "./components/admin/OrdersManagement";
import WhatsAppCampaigns from "./components/admin/WhatsAppCampaigns";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
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
                <ProtectedRoute>
                  <POSPage />
                </ProtectedRoute>
              } />
              <Route path="/kitchen" element={
                <ProtectedRoute>
                  <KitchenPage />
                </ProtectedRoute>
              } />
              <Route path="/management" element={
                <ProtectedRoute>
                  <RestaurantManagement />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersManagement />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={
                <ProtectedRoute>
                  <WhatsAppCampaigns />
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
