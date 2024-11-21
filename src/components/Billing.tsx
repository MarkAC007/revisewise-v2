import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Star, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { stripePromise, createSubscriptionSession, cancelSubscription, updateSubscription } from '../lib/stripe';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'price_premium_monthly',
    name: 'Premium Monthly',
    price: 3.99,
    interval: 'month',
    features: [
      'Advanced learning tools',
      'Parent dashboard access',
      'All subjects support',
      'Priority mentoring',
      'Personalised study plan'
    ]
  },
  {
    id: 'price_premium_yearly',
    name: 'Premium Yearly',
    price: 39.99,
    interval: 'year',
    features: [
      'All Premium Monthly features',
      '2 months free',
      'Premium study materials',
      'Advanced analytics',
      'Priority support'
    ]
  }
];

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.subscriptionId) {
          setSubscription({
            id: userData.subscriptionId,
            status: userData.subscriptionStatus,
            currentPeriodEnd: userData.subscriptionCurrentPeriodEnd,
            priceId: userData.subscriptionTier
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load subscription data');
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    try {
      setLoading(true);
      const sessionId = await createSubscriptionSession(plan.id, user.uid);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    try {
      setLoading(true);
      await cancelSubscription(subscription.id);
      toast.success('Subscription cancelled successfully');
      await loadSubscriptionData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (newPriceId: string) => {
    if (!subscription?.id) return;

    try {
      setLoading(true);
      await updateSubscription(subscription.id, newPriceId);
      toast.success('Subscription updated successfully');
      await loadSubscriptionData();
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {subscription && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold">
                    {subscription.priceId === 'price_premium_monthly' ? 'Premium Monthly' : 'Premium Yearly'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Next Billing Date</span>
                  <span className="font-semibold">
                    {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleUpdateSubscription(
                      subscription.priceId === 'price_premium_monthly' 
                        ? 'price_premium_yearly' 
                        : 'price_premium_monthly'
                    )}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      'Change Plan'
                    )}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      'Cancel Subscription'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that best fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£{plan.price}</span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || (subscription?.priceId === plan.id)}
                    className="mt-8 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : subscription?.priceId === plan.id ? (
                      'Current Plan'
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Subscribe {plan.interval}ly
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Security</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-indigo-600 mr-2" />
                <div>
                  <h4 className="font-semibold">Secure Payments</h4>
                  <p className="text-sm text-gray-600">All transactions are secured with Stripe</p>
                </div>
              </div>
              <div className="flex items-start">
                <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
                <div>
                  <h4 className="font-semibold">Multiple Payment Methods</h4>
                  <p className="text-sm text-gray-600">Pay with credit card or other methods</p>
                </div>
              </div>
              <div className="flex items-start">
                <Star className="h-6 w-6 text-indigo-600 mr-2" />
                <div>
                  <h4 className="font-semibold">Money-back Guarantee</h4>
                  <p className="text-sm text-gray-600">30-day satisfaction guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}