import React from 'react';
import { BookOpen, Brain, Target, Users, Clock, Award } from 'lucide-react';

export default function Features() {
  return (
    <div id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Learning Journey Partner
          </h2>
          <p className="text-xl text-gray-600">
            Building understanding through guided practice and support
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Concept Mastery",
              description: "Break down complex topics into manageable steps"
            },
            {
              icon: Target,
              title: "Focus Tools",
              description: "Stay on track with study timers and goal setting"
            },
            {
              icon: Award,
              title: "Skill Development",
              description: "Build problem-solving and critical thinking abilities"
            },
            {
              icon: Users,
              title: "Peer Learning",
              description: "Connect with study groups and mentors"
            },
            {
              icon: Clock,
              title: "Progress Tracking",
              description: "Monitor your learning journey and growth"
            },
            {
              icon: BookOpen,
              title: "Study Resources",
              description: "Access comprehensive learning materials"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-indigo-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}