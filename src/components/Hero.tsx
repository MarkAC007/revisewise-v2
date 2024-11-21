import React from 'react';
import { GraduationCap, Brain, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartLearning = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup', { state: { plan: 'free' } });
    }
  };

  const handleSchoolPartnerships = () => {
    // For now, we'll show a contact form for schools
    navigate('/support', { state: { subject: 'School Partnership Inquiry' } });
  };

  return (
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Learn Smarter, Not Harder
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">
            ReviseWise guides you through your learning journey with personalized study support and skill development
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={handleStartLearning}
              className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              {user ? 'Go to Dashboard' : 'Start Learning'}
            </button>
            <button 
              onClick={handleSchoolPartnerships}
              className="bg-white bg-opacity-20 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-30 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              School Partnerships
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white bg-opacity-10 p-6 rounded-xl transform hover:scale-105 transition-all hover:bg-opacity-15">
              <GraduationCap className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Guided Learning</h3>
              <p className="text-indigo-100">Step-by-step concept breakdowns and practice exercises</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl transform hover:scale-105 transition-all hover:bg-opacity-15">
              <Brain className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Skill Building</h3>
              <p className="text-indigo-100">Develop critical thinking and problem-solving abilities</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl transform hover:scale-105 transition-all hover:bg-opacity-15">
              <Clock className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-indigo-100">Monitor your growth with detailed learning analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}