import React, { createContext, useContext, useState, useEffect } from 'react';
import { stripePaymentService, SubscriptionStatus, SubscriptionPlan, SUBSCRIPTION_PLANS } from '../services/StripePaymentService';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentContextType {
  // Subscription status
  subscriptionStatus: SubscriptionStatus;
  isLoading: boolean;
  isPremium: boolean;
  
  // Available plans
  availablePlans: SubscriptionPlan[];
  recommendedPlan: SubscriptionPlan | null;
  
  // Actions
  purchasePlan: (planId: string, paymentMethodId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  updateSubscription: (newPlanId: string) => Promise<boolean>;
  refreshSubscriptionStatus: () => Promise<void>;
  
  // Payment methods
  paymentMethods: any[];
  addPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  refreshPaymentMethods: () => Promise<void>;
  
  // Premium features
  canAccessFeature: (featureName: string) => boolean;
  getDaysRemaining: () => number;
  getTrialDaysRemaining: () => number;
  
  // Analytics
  trackPremiumFeatureUsage: (feature: string) => void;
  trackSubscriptionEvent: (event: string, data?: any) => void;
}

const PaymentContext = createContext<PaymentContextType | null>(null);

const PREMIUM_FEATURES = new Set([
  'ai_coach_advanced',
  'detailed_analytics',
  'premium_music',
  'exclusive_achievements',
  'no_ads',
  'premium_coupons',
  'multi_device_sync',
  'priority_support',
  'nutrition_plans',
  'monthly_reports',
  'early_access',
  'lifetime_access',
]);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    plan: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    trialEnd: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [recommendedPlan, setRecommendedPlan] = useState<SubscriptionPlan | null>(null);

  // Calculate if user has premium access
  const isPremium = stripePaymentService.isPremiumActive(subscriptionStatus);

  // Load subscription status on mount and user change
  useEffect(() => {
    if (user?.uid) {
      refreshSubscriptionStatus();
      refreshPaymentMethods();
      loadRecommendedPlan();
    } else {
      setSubscriptionStatus({
        isActive: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
      });
      setIsLoading(false);
    }
  }, [user?.uid]);

  const refreshSubscriptionStatus = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const status = await stripePaymentService.getSubscriptionStatus(user.uid);
      setSubscriptionStatus(status);
      
      // Cache status locally
      await AsyncStorage.setItem(
        `subscription_status_${user.uid}`,
        JSON.stringify({ ...status, lastUpdated: Date.now() })
      );
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      
      // Try to load from cache
      try {
        const cached = await AsyncStorage.getItem(`subscription_status_${user.uid}`);
        if (cached) {
          const cachedStatus = JSON.parse(cached);
          // Use cached data if it's less than 1 hour old
          if (Date.now() - cachedStatus.lastUpdated < 3600000) {
            delete cachedStatus.lastUpdated;
            setSubscriptionStatus(cachedStatus);
          }
        }
      } catch (cacheError) {
        console.error('Error loading cached subscription status:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPaymentMethods = async () => {
    if (!user?.uid) return;

    try {
      const methods = await stripePaymentService.getPaymentMethods(user.uid);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error refreshing payment methods:', error);
    }
  };

  const loadRecommendedPlan = async () => {
    if (!user?.uid) return;

    try {
      // Get user profile data for recommendations
      const userStats = await AsyncStorage.getItem(`user_stats_${user.uid}`);
      const userProfile = userStats ? JSON.parse(userStats) : {
        totalWorkouts: 0,
        currentStreak: 0,
        isLongTermUser: false,
      };

      const recommended = stripePaymentService.getRecommendedPlan(userProfile);
      setRecommendedPlan(recommended);
    } catch (error) {
      console.error('Error loading recommended plan:', error);
      setRecommendedPlan(SUBSCRIPTION_PLANS[0]);
    }
  };

  const purchasePlan = async (planId: string, paymentMethodId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      setIsLoading(true);
      trackSubscriptionEvent('purchase_attempt', { planId, paymentMethodId });

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // For recurring subscriptions
      if (plan.interval === 'month' || plan.interval === 'year') {
        const result = await stripePaymentService.createSubscription(
          planId,
          user.uid,
          paymentMethodId
        );

        if (result) {
          await refreshSubscriptionStatus();
          trackSubscriptionEvent('purchase_success', { planId });
          return true;
        }
      } else {
        // For one-time payments (lifetime)
        const paymentIntent = await stripePaymentService.createPaymentIntent(
          planId,
          user.uid
        );

        if (paymentIntent) {
          // Process payment intent with provided payment method
          // This would typically involve Stripe's confirmPayment method
          await refreshSubscriptionStatus();
          trackSubscriptionEvent('purchase_success', { planId });
          return true;
        }
      }

      trackSubscriptionEvent('purchase_failed', { planId });
      return false;
    } catch (error) {
      console.error('Error purchasing plan:', error);
      trackSubscriptionEvent('purchase_error', { planId, error: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      setIsLoading(true);
      trackSubscriptionEvent('cancel_attempt');

      const success = await stripePaymentService.cancelSubscription(user.uid);
      
      if (success) {
        await refreshSubscriptionStatus();
        trackSubscriptionEvent('cancel_success');
        return true;
      }

      trackSubscriptionEvent('cancel_failed');
      return false;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      trackSubscriptionEvent('cancel_error', { error: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (newPlanId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      setIsLoading(true);
      trackSubscriptionEvent('update_attempt', { newPlanId });

      const success = await stripePaymentService.updateSubscription(user.uid, newPlanId);
      
      if (success) {
        await refreshSubscriptionStatus();
        trackSubscriptionEvent('update_success', { newPlanId });
        return true;
      }

      trackSubscriptionEvent('update_failed', { newPlanId });
      return false;
    } catch (error) {
      console.error('Error updating subscription:', error);
      trackSubscriptionEvent('update_error', { newPlanId, error: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      const success = await stripePaymentService.addPaymentMethod(user.uid, paymentMethodId);
      
      if (success) {
        await refreshPaymentMethods();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return false;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    try {
      const success = await stripePaymentService.removePaymentMethod(paymentMethodId);
      
      if (success) {
        await refreshPaymentMethods();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing payment method:', error);
      return false;
    }
  };

  const canAccessFeature = (featureName: string): boolean => {
    // Free tier users have limited access
    if (!isPremium) {
      const freeTierFeatures = new Set([
        'basic_workouts',
        'basic_analytics',
        'basic_music',
        'basic_achievements',
      ]);
      return freeTierFeatures.has(featureName);
    }

    // Premium users have access to all features
    return true;
  };

  const getDaysRemaining = (): number => {
    return stripePaymentService.getDaysRemaining(subscriptionStatus);
  };

  const getTrialDaysRemaining = (): number => {
    if (!subscriptionStatus.trialEnd) return 0;
    
    const now = new Date();
    const trialEnd = subscriptionStatus.trialEnd;
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const trackPremiumFeatureUsage = async (feature: string) => {
    try {
      if (!user?.uid) return;

      // Track premium feature usage for analytics
      const usageData = {
        userId: user.uid,
        feature,
        timestamp: Date.now(),
        isPremium,
        subscriptionPlan: subscriptionStatus.plan?.id || 'free',
      };

      // Store locally for later sync
      const existingUsage = await AsyncStorage.getItem(`feature_usage_${user.uid}`);
      const usageArray = existingUsage ? JSON.parse(existingUsage) : [];
      usageArray.push(usageData);

      // Keep only last 100 entries
      const trimmedUsage = usageArray.slice(-100);
      await AsyncStorage.setItem(`feature_usage_${user.uid}`, JSON.stringify(trimmedUsage));

      // TODO: Send to analytics service
      console.log('Premium feature used:', feature, 'isPremium:', isPremium);
    } catch (error) {
      console.error('Error tracking premium feature usage:', error);
    }
  };

  const trackSubscriptionEvent = async (event: string, data?: any) => {
    try {
      if (!user?.uid) return;

      const eventData = {
        userId: user.uid,
        event,
        data,
        timestamp: Date.now(),
        subscriptionStatus,
      };

      // Store locally for later sync
      const existingEvents = await AsyncStorage.getItem(`subscription_events_${user.uid}`);
      const eventsArray = existingEvents ? JSON.parse(existingEvents) : [];
      eventsArray.push(eventData);

      // Keep only last 50 events
      const trimmedEvents = eventsArray.slice(-50);
      await AsyncStorage.setItem(`subscription_events_${user.uid}`, JSON.stringify(trimmedEvents));

      console.log('Subscription event:', event, data);
    } catch (error) {
      console.error('Error tracking subscription event:', error);
    }
  };

  const value: PaymentContextType = {
    subscriptionStatus,
    isLoading,
    isPremium,
    availablePlans: SUBSCRIPTION_PLANS,
    recommendedPlan,
    purchasePlan,
    cancelSubscription,
    updateSubscription,
    refreshSubscriptionStatus,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    refreshPaymentMethods,
    canAccessFeature,
    getDaysRemaining,
    getTrialDaysRemaining,
    trackPremiumFeatureUsage,
    trackSubscriptionEvent,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};