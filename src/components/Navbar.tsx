import React, { useState } from 'react';
import { BookOpen, Menu, X, HelpCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handlePortalClick = async () => {
    try {
      setLoading(true);
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (error) {
      toast.error('Navigation failed. Please try again.');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleNavigation = (section: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate(`/?section=${section}`);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-indigo-600 text-white w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <BookOpen className="h-8 w-8 text-yellow-300" />
            <span className="ml-2 text-xl font-bold">ReviseWise</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => handleNavigation('features')}
                className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation('pricing')}
                className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors"
              >
                Pricing
              </button>
              <Link 
                to="/support" 
                className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Support
              </Link>
              <button
                onClick={handlePortalClick}
                disabled={loading}
                className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Student Portal'}
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 hover:bg-indigo-500 rounded-md transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => handleNavigation('features')}
              className="block hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors w-full text-left"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation('pricing')}
              className="block hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors w-full text-left"
            >
              Pricing
            </button>
            <Link 
              to="/support"
              className="block hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Support
            </Link>
            <button
              onClick={handlePortalClick}
              disabled={loading}
              className="w-full text-left block bg-yellow-400 text-indigo-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Student Portal'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}