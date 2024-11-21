import React from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Privacy Matters
          </h2>
          <p className="text-xl text-gray-600">
            ReviseWise is committed to protecting your personal information
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-6 w-6 text-indigo-600 mr-2" />
              Data Protection
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li>• End-to-end encryption for all personal data</li>
              <li>• Regular security audits and updates</li>
              <li>• Compliance with UK GDPR regulations</li>
              <li>• Secure cloud storage with redundancy</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lock className="h-6 w-6 text-indigo-600 mr-2" />
              Data Usage
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Study data used only for improving your experience</li>
              <li>• No sharing with third parties</li>
              <li>• Anonymous analytics for service improvement</li>
              <li>• Full control over your data</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Key Privacy Points</h3>
          <div className="space-y-6">
            <p className="text-gray-600">
              ReviseWise collects and processes personal information necessary for providing our educational services. This includes:
            </p>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <Eye className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Study patterns and progress data to personalize your learning experience</span>
              </li>
              <li className="flex items-start">
                <FileCheck className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Academic performance metrics to track improvement</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-indigo-600 mr-2 mt-1" />
                <span>Basic account information for authentication and security</span>
              </li>
            </ul>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including regular security assessments and employee training.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}