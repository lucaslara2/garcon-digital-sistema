
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string) => void;
  trackOrderCreated: (orderId: string, total: number) => void;
  trackUserAction: (action: string, details?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    console.log('Analytics Event:', {
      event: eventName,
      timestamp: new Date().toISOString(),
      user: userProfile?.id,
      restaurant: userProfile?.restaurant_id,
      ...properties
    });

    // Aqui você pode integrar com serviços como Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        restaurant_id: userProfile?.restaurant_id,
        user_role: userProfile?.role,
        ...properties
      });
    }
  };

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', { page: pageName });
  };

  const trackOrderCreated = (orderId: string, total: number) => {
    trackEvent('order_created', {
      order_id: orderId,
      total_amount: total,
      currency: 'BRL'
    });
  };

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    trackEvent('user_action', {
      action,
      ...details
    });
  };

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackOrderCreated,
      trackUserAction
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
