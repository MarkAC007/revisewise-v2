import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  doc, 
  updateDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { 
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import toast from 'react-hot-toast';
import { 
  User,
  Camera,
  Lock,
  CreditCard,
  MapPin,
  Save,
  X,
  Loader,
  Settings,
  History,
  BarChart,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

interface UserData {
  createdAt: Timestamp;
  dailyReset: Timestamp;
  email: string;
  lastQuery: Timestamp;
  queries: Array<{
    text: string;
    timestamp: Timestamp;
    tokens: number;
  }>;
  queriesToday: number;
  role: 'student';
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  stats: {
    lastActive: Timestamp;
    sessionsCompleted: number;
    totalStudyTime: number;
    totalQueries: number;
  };
  updatedAt: Timestamp;
  name?: string;
  phone?: string;
  country?: string;
  region?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  photoURL?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [image, setImage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = async () => {
    if (!cropperRef.current || !image) return;

    try {
      setLoading(true);
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL();
      
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `profile-images/${user?.uid}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      if (user) {
        await updateFirebaseProfile(user, {
          photoURL: downloadURL
        });
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          photoURL: downloadURL
        });

        await loadUserData();
      }
      
      setImage(null);
      toast.success('Profile image updated successfully');
    } catch (error) {
      toast.error('Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }
      
      await sendPasswordResetEmail(user.email);
      toast.success('Password reset email sent');
      setCurrentPassword('');
    } catch (error) {
      toast.error('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<UserData['settings']>) => {
    if (!user || !userData) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'settings': {
          ...userData.settings,
          ...updates
        }
      });
      await loadUserData();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={userData?.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="font-semibold">{userData?.name || user?.email}</h3>
          <p className="text-sm text-gray-500">{userData?.email}</p>
          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full mt-1">
            {userData?.role}
          </span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Image Cropper Modal */}
      {image && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crop Image</h3>
              <button
                onClick={() => setImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Cropper
              ref={cropperRef}
              src={image}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              guides={true}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setImage(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Creation Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Member since: {userData?.createdAt && formatDate(userData.createdAt)}
        </p>
        <p className="text-sm text-gray-600">
          Last active: {userData?.stats?.lastActive && formatDate(userData.stats.lastActive)}
        </p>
      </div>

      {/* Password Reset Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Password Reset
        </h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Send Reset Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderQueryHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Query History</h3>
        <div className="text-sm text-gray-600">
          Today's Queries: {userData?.queriesToday || 0}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userData?.queries?.slice().reverse().map((query, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {query.text}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(query.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.tokens}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Learning Statistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Study Sessions
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {userData?.stats?.sessionsCompleted || 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Total Study Time
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {userData?.stats?.totalStudyTime && formatDuration(userData.stats.totalStudyTime)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Total Queries
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {userData?.stats?.totalQueries || 0}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold mb-4">Activity Timeline</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Query</span>
            <span className="text-sm font-medium">
              {userData?.lastQuery && formatDate(userData.lastQuery)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Daily Reset</span>
            <span className="text-sm font-medium">
              {userData?.dailyReset && formatDate(userData.dailyReset)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preferences</h3>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Notifications</h4>
            <p className="text-sm text-gray-500">
              Receive updates about your learning progress
            </p>
          </div>
          <button
            onClick={() => handleUpdateSettings({ 
              notifications: !userData?.settings?.notifications 
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              userData?.settings?.notifications 
                ? 'bg-indigo-600' 
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                userData?.settings?.notifications 
                  ? 'translate-x-6' 
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Theme</h4>
            <p className="text-sm text-gray-500">
              Choose your preferred appearance
            </p>
          </div>
          <button
            onClick={() => handleUpdateSettings({ 
              theme: userData?.settings?.theme === 'light' ? 'dark' : 'light' 
            })}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {userData?.settings?.theme === 'light' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, content: renderProfileTab },
    { id: 'queries', label: 'Queries', icon: History, content: renderQueryHistoryTab },
    { id: 'stats', label: 'Statistics', icon: BarChart, content: renderStatsTab },
    { id: 'settings', label: 'Settings', icon: Settings, content: renderSettingsTab }
  ];

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tabs.find(tab => tab.id === activeTab)?.content()}
        </div>
      </div>
    </div>
  );
}