import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = (plan: string) => {
    if (user) {
      navigate('/billing');
    } else {
      navigate('/signup', { state: { plan } });
    }
  };

  return (
    <div id="pricing" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Term-Based Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Flexible plans for students, parents, and schools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Student",
              price: "Free",
              features: [
                "Basic study timer",
                "Focus mode",
                "Progress tracking",
                "Core learning resources"
              ],
              plan: "free"
            },
            {
              name: "Premium",
              price: "£3.99",
              popular: true,
              features: [
                "Everything in Student",
                "Advanced learning tools",
                "Parent dashboard access",
                "All subjects support",
                "Priority mentoring",
                "Personalised study plan"
              ],
              plan: "premium"
            },
            {
              name: "School",
              price: "Custom",
              features: [
                "Everything in Premium",
                "Bulk student licenses",
                "Teacher dashboard",
                "Learning analytics",
                "Curriculum integration",
                "Training and support"
              ],
              plan: "school"
            }
          ].map((tier, index) => (
            <div key={index} className={`rounded-xl p-8 ${
              tier.popular 
                ? 'bg-indigo-600 text-white transform scale-105 shadow-xl' 
                : 'bg-white shadow-lg'
            }`}>
              <h3 className="text-2xl font-bold mb-4">{tier.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "Free" && tier.price !== "Custom" && <span className="text-sm">/month</span>}
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className={`h-5 w-5 mr-2 ${
                      tier.popular ? 'text-yellow-400' : 'text-indigo-600'
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStarted(tier.plan)}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-yellow-400 text-indigo-900 hover:bg-yellow-300'
                    : tier.name === "School"
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {tier.name === "School" ? "Contact Us" : "Get Started"}
              </button>
              {tier.popular && (
                <p className="text-sm text-indigo-100 text-center mt-4">
                  No credit card required for trial
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 30-day satisfaction guarantee. Need help choosing?{' '}
            <button
              onClick={() => navigate('/support')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Contact our team
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}