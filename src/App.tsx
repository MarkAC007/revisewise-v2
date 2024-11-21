import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Installation from './components/Installation';
import Privacy from './components/Privacy';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import Billing from './components/Billing';
import Support from './components/Support';
import BetaBanner from './components/BetaBanner';

function ScrollToSection() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Clean up the URL
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <BetaBanner />
          <div className="flex-1">
            <Navbar />
            <ScrollToSection />
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <Features />
                  <Pricing />
                  <Installation />
                  <Privacy />
                </>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/support" element={<Support />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;