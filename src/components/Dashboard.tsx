import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import { 
  BookOpen, 
  Settings,
  LogOut,
  User,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'settings':
        toast.error('Settings page not implemented yet');
        return null;
      default:
        return (
          <div className="space-y-6">
            {/* Subscription Status Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
                  <p className="text-indigo-100">Upgrade to Premium for advanced features</p>
                </div>
                <button
                  onClick={() => navigate('/billing')}
                  className="px-6 py-2 bg-yellow-400 text-indigo-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
              <p className="text-gray-600">
                Get started by exploring our features or upgrading your account for premium access.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                   onClick={() => navigate('/billing')}>
                <div className="flex items-center justify-between">
                  <div>
                    <CreditCard className="h-8 w-8 text-indigo-600" />
                    <h3 className="mt-2 text-lg font-semibold">Manage Subscription</h3>
                    <p className="text-sm text-gray-500">View and update your plan</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                   onClick={() => setActiveTab('profile')}>
                <div className="flex items-center justify-between">
                  <div>
                    <User className="h-8 w-8 text-indigo-600" />
                    <h3 className="mt-2 text-lg font-semibold">Profile Settings</h3>
                    <p className="text-sm text-gray-500">Update your information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6 py-8">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.email}</h3>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', icon: BookOpen, label: 'Overview' },
                  { id: 'profile', icon: User, label: 'Profile' },
                  { id: 'billing', icon: CreditCard, label: 'Subscription', onClick: () => navigate('/billing') },
                  { id: 'settings', icon: Settings, label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick || (() => setActiveTab(item.id))}
                    disabled={loading}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}