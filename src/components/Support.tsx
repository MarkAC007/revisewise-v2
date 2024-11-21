import React, { useState } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  Building,
  Phone,
  Globe,
  Send,
  Loader
} from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Support() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: location.state?.subject || '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'support_requests'), {
        ...contactForm,
        timestamp: new Date(),
        status: 'new'
      });
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
          <p className="mt-4 text-xl text-gray-600">We're here to help you succeed</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Support Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Email Support</h3>
              </div>
              <p className="text-gray-600 mb-2">Available 24/7 for your inquiries</p>
              <a href="mailto:help@revisewise.xyz" className="text-indigo-600 hover:text-indigo-700">
                help@revisewise.xyz
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Live Chat</h3>
              </div>
              <p className="text-gray-600">Chat with our support team</p>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM GMT</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Response Time</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Email: Within 24 hours</li>
                <li>• Live Chat: Typically under 5 minutes</li>
                <li>• Complex Issues: Up to 48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Building className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">READWISE is a dbo for Ginga Ninja Holdings Ltd</p>
                <p className="text-sm text-gray-500">Company Registration: SC639849</p>
                <p className="text-sm text-gray-500">Office 10, Technology House, 9 Newton Place, Glasgow, G3 7PR</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+441234567890" className="flex items-center text-indigo-600 hover:text-indigo-700">
                <Phone className="h-4 w-4 mr-1" />
                <span>+44 123 456 7890</span>
              </a>
              <a href="https://app.revisewise.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-700">
                <Globe className="h-4 w-4 mr-1" />
                <span>app.revisewise.xyz</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}