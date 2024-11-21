import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createSubscriptionSession = async (priceId: string, userId: string) => {
  try {
    const response = await fetch('https://app.revisewise.xyz/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        returnUrl: `${window.location.origin}/billing`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating subscription session:', error);
    throw new Error('Failed to create subscription session');
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch('https://app.revisewise.xyz/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    const { success } = await response.json();
    return success;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

export const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  try {
    const response = await fetch('https://app.revisewise.xyz/api/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId, newPriceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    const { success } = await response.json();
    return success;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
};