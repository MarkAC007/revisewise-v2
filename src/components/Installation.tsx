import React from 'react';
import { Chrome, ArrowRight } from 'lucide-react';

export default function Installation() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quick Installation Guide
          </h2>
          <p className="text-xl text-gray-600">
            Get started with StudyBuddy in just a few clicks
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: 1,
              title: "Visit Chrome Web Store",
              description: "Find StudyBuddy in the Chrome Web Store"
            },
            {
              step: 2,
              title: "Add to Chrome",
              description: "Click 'Add to Chrome' and confirm installation"
            },
            {
              step: 3,
              title: "Start Learning",
              description: "Create your account and start studying smarter"
            }
          ].map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-indigo-50 p-6 rounded-xl">
                <div className="text-4xl font-bold text-indigo-600 mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              {index < 2 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-indigo-300 h-12 w-12" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors">
            <Chrome className="mr-2 h-6 w-6" />
            Add to Chrome
          </button>
        </div>
      </div>
    </div>
  );
}