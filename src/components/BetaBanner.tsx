import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BetaBanner() {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'betaRequests'), {
        email,
        timestamp: new Date(),
        status: 'pending'
      });
      
      toast.success('Thanks for your interest! We\'ll be in touch soon.');
      setEmail('');
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-900 w-full z-[100] relative border-b border-gray-800">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-indigo-600">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span className="md:hidden">Beta Testing Now Open!</span>
              <span className="hidden md:inline">🚀 Beta Testing Now Open! Join our early access program</span>
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-3">
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-1.5 rounded-l-md border-0 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 w-full sm:w-auto"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Join Beta'}
              </button>
            </form>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              className="flex p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}