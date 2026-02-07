import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  popular?: boolean;
  discount?: number;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}

// Configuration for different subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'iron_basic_monthly',
    name: 'Iron Premium Mensual',
    description: 'Acceso completo a todas las características premium',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_iron_basic_monthly', // Replace with actual Stripe price ID
    features: [
      '🤖 IA Coach avanzada con planes personalizados',
      '📊 Análisis detallado de progreso y estadísticas',
      '🎵 Biblioteca musical premium ilimitada',
      '🏆 Logros y desafíos exclusivos',
      '⚡ Sin anuncios ni interrupciones',
      '💎 Descuentos especiales en cupones (hasta 50% OFF)',
      '🔄 Sincronización en múltiples dispositivos',
      '📱 Soporte prioritario 24/7',
    ],
  },
  {
    id: 'iron_pro_yearly',
    name: 'Iron Premium Anual',
    description: 'Tu mejor inversión en fitness - 40% de descuento',
    price: 7999, // $79.99 in cents (normally $119.88)
    currency: 'usd',
    interval: 'year',
    stripePriceId: 'price_iron_pro_yearly',
    popular: true,
    discount: 40,
    features: [
      '🤖 IA Coach avanzada con planes personalizados',
      '📊 Análisis detallado de progreso y estadísticas',
      '🎵 Biblioteca musical premium ilimitada',
      '🏆 Logros y desafíos exclusivos',
      '⚡ Sin anuncios ni interrupciones',
      '💎 Descuentos especiales en cupones (hasta 50% OFF)',
      '🔄 Sincronización en múltiples dispositivos',
      '📱 Soporte prioritario 24/7',
      '🎯 Planes de nutrición personalizados',
      '📈 Reportes mensuales de progreso detallados',
      '🏋️‍♂️ Acceso temprano a nuevas características',
      '💰 ¡Ahorra $40 al año!',
    ],
  },
  {
    id: 'iron_lifetime',
    name: 'Iron Premium de por Vida',
    description: 'Una sola vez, acceso de por vida a todas las características',
    price: 19999, // $199.99 in cents
    currency: 'usd',
    interval: 'month', // Not recurring
    stripePriceId: 'price_iron_lifetime',
    features: [
      '🔓 Acceso de por vida a todas las características',
      '🤖 IA Coach avanzada con planes personalizados',
      '📊 Análisis detallado de progreso y estadísticas',
      '🎵 Biblioteca musical premium ilimitada',
      '🏆 Todos los logros y desafíos actuales y futuros',
      '⚡ Sin anuncios nunca más',
      '💎 Descuentos máximos en cupones (hasta 70% OFF)',
      '📱 Soporte VIP de por vida',
      '🎯 Todas las características futuras incluidas',
      '🏆 Estatus de miembro fundador',
      '💎 ¡La mejor inversión en tu fitness!',
    ],
  },
];

class StripePaymentService {
  private publishableKey: string;
  private apiUrl: string;
  
  constructor() {
    // In production, these should come from environment variables
    this.publishableKey = Constants.expoConfig?.extra?.stripe?.publishableKey || 'pk_test_...';
    this.apiUrl = Constants.expoConfig?.extra?.stripe?.apiUrl || 'https://your-backend.com/api';
  }

  getPublishableKey(): string {
    return this.publishableKey;
  }

  async createPaymentIntent(planId: string, userId: string): Promise<PaymentIntent | null> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const response = await fetch(`${this.apiUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: plan.currency,
          planId: plan.id,
          userId: userId,
          metadata: {
            planName: plan.name,
            interval: plan.interval,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        amount: plan.price,
        currency: plan.currency,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  async createSubscription(planId: string, userId: string, paymentMethodId: string): Promise<{ clientSecret: string } | null> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const response = await fetch(`${this.apiUrl}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: userId,
          paymentMethodId: paymentMethodId,
          metadata: {
            planId: plan.id,
            planName: plan.name,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.apiUrl}/subscription-status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      const data = await response.json();
      
      return {
        isActive: data.isActive,
        plan: data.planId ? SUBSCRIPTION_PLANS.find(p => p.id === data.planId) || null : null,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000) : null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        trialEnd: data.trialEnd ? new Date(data.trialEnd * 1000) : null,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
      };
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async updateSubscription(userId: string, newPlanId: string): Promise<boolean> {
    try {
      const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === newPlanId);
      if (!newPlan) {
        throw new Error('New plan not found');
      }

      const response = await fetch(`${this.apiUrl}/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPriceId: newPlan.stripePriceId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  async getPaymentMethods(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/payment-methods/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  async addPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/add-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          paymentMethodId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding payment method:', error);
      return false;
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/remove-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing payment method:', error);
      return false;
    }
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/process-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount, // Optional partial refund amount
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  // Calculate savings for yearly plans
  calculateYearlySavings(monthlyPlan: SubscriptionPlan, yearlyPlan: SubscriptionPlan): number {
    const monthlyTotal = monthlyPlan.price * 12;
    const savings = monthlyTotal - yearlyPlan.price;
    return Math.round((savings / monthlyTotal) * 100);
  }

  // Get recommended plan based on user profile
  getRecommendedPlan(userProfile: any): SubscriptionPlan {
    const { totalWorkouts, currentStreak, isLongTermUser } = userProfile;

    // For committed users, recommend yearly
    if (currentStreak > 30 || totalWorkouts > 50 || isLongTermUser) {
      return SUBSCRIPTION_PLANS.find(p => p.id === 'iron_pro_yearly') || SUBSCRIPTION_PLANS[0];
    }

    // For very committed users, suggest lifetime
    if (currentStreak > 100 || totalWorkouts > 200) {
      return SUBSCRIPTION_PLANS.find(p => p.id === 'iron_lifetime') || SUBSCRIPTION_PLANS[0];
    }

    // Default to monthly for new users
    return SUBSCRIPTION_PLANS.find(p => p.id === 'iron_basic_monthly') || SUBSCRIPTION_PLANS[0];
  }

  // Format price for display
  formatPrice(price: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  }

  // Check if user has active premium subscription
  isPremiumActive(subscriptionStatus: SubscriptionStatus): boolean {
    return subscriptionStatus.isActive && 
           subscriptionStatus.currentPeriodEnd ? 
           subscriptionStatus.currentPeriodEnd > new Date() : false;
  }

  // Get days remaining in subscription
  getDaysRemaining(subscriptionStatus: SubscriptionStatus): number {
    if (!subscriptionStatus.currentPeriodEnd) return 0;
    
    const now = new Date();
    const end = subscriptionStatus.currentPeriodEnd;
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const stripePaymentService = new StripePaymentService();