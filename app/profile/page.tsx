'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart3, Gamepad2, Library, BookOpen, User, LogOut, Shield, Sparkles, TrendingUp, Calendar, Award, Settings, Camera, Edit3, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface GardenState {
  plants: number;
  flowers: number;
  health: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
    fetchGardenState();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setFormData({ name: data.data.name, email: data.data.email });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGardenState = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/games/mind-garden', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGarden(data.data);
      }
    } catch (error) {
      console.error('Error fetching garden state:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUser({ ...user!, name: formData.name, email: formData.email });
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-blue-100">
      <Navbar />
      <div className="w-full px-2 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Profile Header */}
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">{user?.name}</h1>
              <p className="text-blue-600 mb-4">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-200">
                  Member since {new Date(user?.createdAt || '').getFullYear()}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm border border-green-200">
                  Active User
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 bg-white border border-blue-100 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'account'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                : 'text-blue-700 hover:text-white hover:bg-blue-100'
                }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'progress'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                : 'text-blue-700 hover:text-white hover:bg-blue-100'
                }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg'
                : 'text-blue-700 hover:text-white hover:bg-blue-100'
                }`}
            >
              Settings
            </button>
          </div>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Account Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-200 transition-all duration-300"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl">
                    {error}
                  </div>
                )}
                {isEditing && (
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    Save Changes
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-8 w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:from-red-600 hover:to-pink-600 shadow-lg"
                >
                  <LogOut className="w-5 h-5 inline-block mr-2" /> Logout
                </button>
              </form>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-8 font-serif">
              {/* Wellness Dashboard */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100 font-serif">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-blue-900 font-serif">Wellness Journey</h2>
                </div>
                {garden ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-6 text-center font-serif">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2 font-serif">Wellness Score</h3>
                      <div className="text-4xl font-bold text-blue-900 mb-2 font-serif">{garden.health}%</div>
                      <p className="text-blue-700 text-sm font-serif">Overall mental wellness</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded-2xl p-6 text-center font-serif">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2 font-serif">Consistent Days</h3>
                      <div className="text-4xl font-bold text-green-900 mb-2 font-serif">{garden.plants}</div>
                      <p className="text-green-700 text-sm font-serif">Days of progress tracking</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-2xl p-6 text-center font-serif">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2 font-serif">Milestones</h3>
                      <div className="text-4xl font-bold text-purple-900 mb-2 font-serif">{garden.flowers}</div>
                      <p className="text-purple-700 text-sm font-serif">Goals achieved</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 font-serif">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-3 font-serif">Start Your Wellness Journey</h3>
                    <p className="text-blue-700 mb-6 max-w-md mx-auto font-serif">
                      Begin tracking your mood, thoughts, and progress to unlock insights about your mental health journey.
                    </p>
                    <Link
                      href="/games"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 font-serif"
                    >
                      Begin Assessment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100 font-serif">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-blue-900 font-serif">Privacy & Settings</h2>
              </div>
              <div className="space-y-6">
                <div className="border-b border-blue-100 pb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 font-serif">Privacy Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-900 font-medium font-serif">Data Sharing</p>
                        <p className="text-blue-700 text-sm font-serif">Allow anonymous data for research purposes</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-200 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-900 font-medium font-serif">Activity Notifications</p>
                        <p className="text-blue-700 text-sm font-serif">Receive reminders for check-ins and activities</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-200 rounded-full relative transition-colors">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-b border-blue-100 pb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 font-serif">Account Security</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 hover:bg-blue-100 transition-colors font-serif">
                      Change Password
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 hover:bg-blue-100 transition-colors font-serif">
                      Two-Factor Authentication
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 hover:bg-blue-100 transition-colors font-serif">
                      Login Activity
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 font-serif">Data Management</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 hover:bg-blue-100 transition-colors font-serif">
                      Export My Data
                    </button>
                    <button className="w-full text-left px-4 py-3 bg-red-100 border border-red-200 rounded-xl text-red-700 hover:bg-red-200 transition-colors font-serif">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}