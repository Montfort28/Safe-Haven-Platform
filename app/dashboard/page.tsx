'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, BookOpen, User, Home, BarChart3, Gamepad2, Library, Plus, TrendingUp, Sun, Flame, Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { formatDate } from '@/lib/utils';
import SoundPlayer from '@/components/SoundPlayer';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
}

interface MoodData {
  day: string;
  mood: number;
  date: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ActivityStats {
  totalMoodEntries: number;
  totalJournalEntries: number;
  streak: number;
  averageMood: number;
}

// Enhanced sample mood data for demo
const SAMPLE_MOOD_DATA: MoodData[] = [
  { day: 'Mon', mood: 6, date: '2024-01-01' },
  { day: 'Tue', mood: 7, date: '2024-01-02' },
  { day: 'Wed', mood: 5, date: '2024-01-03' },
  { day: 'Thu', mood: 8, date: '2024-01-04' },
  { day: 'Fri', mood: 6, date: '2024-01-05' },
  { day: 'Sat', mood: 7, date: '2024-01-06' },
  { day: 'Sun', mood: 6, date: '2024-01-07' },
];

const AFFIRMATIONS = [
  'You are enough just as you are.',
  'Every day is a new beginning.',
  'You have the strength to overcome any challenge.',
  'Your feelings are valid.',
  'You are making progress, even if it\'s hard to see.',
  'You are worthy of love and kindness.',
  'Take a deep breath and trust yourself.',
  'You are not alone on this journey.',
  'Small steps lead to big changes.',
  'You are resilient and capable.'
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  const [moodData, setMoodData] = useState<MoodData[]>([
    { day: 'Mon', mood: 6, date: '2024-01-01' },
    { day: 'Tue', mood: 7, date: '2024-01-02' },
    { day: 'Wed', mood: 5, date: '2024-01-03' },
    { day: 'Thu', mood: 8, date: '2024-01-04' },
    { day: 'Fri', mood: 6, date: '2024-01-05' },
    { day: 'Sat', mood: 7, date: '2024-01-06' },
    { day: 'Sun', mood: 6, date: '2024-01-07' },
  ]);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalMoodEntries: 0,
    totalJournalEntries: 0,
    streak: 0,
    averageMood: 0
  });
  const [affirmation, setAffirmation] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [relaxationTime, setRelaxationTime] = useState(300); // 5 minutes in seconds
  const [isRelaxationActive, setIsRelaxationActive] = useState(false);
  const [relaxationTimer, setRelaxationTimer] = useState<NodeJS.Timeout | null>(null);
  const [showWelcome, setShowWelcome] = useState(true); // Default to true for now
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setTimeout(() => setShowWelcome(true), 500);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user data
      const userResponse = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data);
      }

      // Fetch mood data
      const moodResponse = await fetch('/api/mood/recent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (moodResponse.ok) {
        const moodData = await moodResponse.json();
        const formattedData = Array.isArray(moodData.data)
          ? moodData.data.map((entry: any) => ({
            day: formatDate(entry.date),
            mood: entry.mood,
            date: entry.date
          }))
          : [];
        setMoodData(formattedData);

        // Calculate suggestions based on mood
        if (formattedData.length > 0) {
          const avgMood = formattedData.reduce((sum: number, entry: any) => sum + entry.mood, 0) / formattedData.length;
          if (avgMood < 4) {
            const suggestions = [
              'Your mood seems low. Try nurturing your Mind Garden to feel more grounded.',
              'Feeling down? Play a relaxing game to lift your spirits.',
              'Consider writing in your journal to express your thoughts.',
              'Explore our resources for coping strategies.',
            ];
            setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
          }
        }
      }

      // Fetch journal entries
      const journalResponse = await fetch('/api/journal?limit=3', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (journalResponse.ok) {
        const journalData = await journalResponse.json();
        setRecentEntries(journalData.data);
      }

      // Fetch activity stats
      const statsResponse = await fetch('/api/games/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setActivityStats(prevStats => ({
          ...prevStats,
          streak: statsData.data.streak || 0,
          totalMoodEntries: moodData.length || 0,
          totalJournalEntries: recentEntries.length || 0,
          averageMood: moodData.length > 0 ? moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length : 0
        }));
      }

      await fetchNewAffirmation();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchNewAffirmation = async () => {
    try {
      const response = await fetch('/api/affirmation/random');
      if (response.ok) {
        const affirmationData = await response.json();
        setAffirmation(affirmationData.data.content);
      } else {
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
      }
    } catch (error) {
      setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    }
  };

  const startRelaxation = () => {
    setIsRelaxationActive(true);
    const timer = setInterval(() => {
      setRelaxationTime(prev => {
        if (prev <= 1) {
          setIsRelaxationActive(false);
          clearInterval(timer);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    setRelaxationTimer(timer);
  };

  const pauseRelaxation = () => {
    if (relaxationTimer) {
      clearInterval(relaxationTimer);
      setRelaxationTimer(null);
    }
    setIsRelaxationActive(false);
  };

  const resetRelaxation = () => {
    if (relaxationTimer) {
      clearInterval(relaxationTimer);
      setRelaxationTimer(null);
    }
    setIsRelaxationActive(false);
    setRelaxationTime(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200">
          <p className="text-slate-700 font-medium">{`${label}: ${payload[0].value}/10`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
      <SoundPlayer src="/sounds/ambient-rain.mp3" loop />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className={`mb-8 transition-all duration-1000 ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-4xl font-bold text-slate-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-600 text-lg mb-4">
              Here's your personalized wellness overview. Track your mood, write in your journal, and nurture your mental garden.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">📊 View mood trends</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">📝 Journal entries</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">🎮 Wellness games</span>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">🌱 Mind garden</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Mood Chart */}
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                Mood Journey
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 7 days</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[1, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#moodGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#1d4ed8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {moodData.length === 0 && (
              <div className="mt-4 text-center py-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <p className="text-slate-600 mb-3">This is a sample graph. Start tracking your mood to see your own data!</p>
                <Link href="/mood" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                  <Heart className="w-4 h-4" />
                  Add your first mood entry
                </Link>
              </div>
            )}
            {suggestion && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-blue-700 rounded-lg text-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  {suggestion}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-500" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link href="/mood" className="group w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
                <Heart className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Log Mood</span>
              </Link>
              <Link href="/journal" className="group w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
                <BookOpen className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Write Journal</span>
              </Link>
              <Link href="/mind-garden" className="group w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
                <svg className="w-5 h-5 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2s-6 3-6 10c0 3.3 2.7 6 6 6s6-2.7 6-6c0-7-6-10-6-10z" />
                </svg>
                <span className="font-medium">Nurture Garden</span>
              </Link>
              <Link href="/games" className="group w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg transform">
                <Gamepad2 className="w-5 h-5 group-hover:animate-pulse" />
                <span className="font-medium">Play a Game</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Journal Entries */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Recent Journal Entries
              </h2>
              <Link href="/journal" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentEntries.length > 0 ? (
                recentEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="group border-l-4 border-blue-500 pl-4 py-3 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg transition-all duration-300 hover:from-blue-100 hover:shadow-md"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h3 className="font-medium text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {entry.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400 animate-pulse" />
                  <p className="text-slate-500 mb-4">No journal entries yet</p>
                  <Link href="/journal" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4" />
                    Start Writing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 hover:shadow-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Your Progress
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <Flame className="w-12 h-12 mx-auto mb-2 text-orange-500 animate-pulse" />
                <p className="text-2xl font-bold text-slate-800">{activityStats.streak}</p>
                <p className="text-sm text-slate-600">Day Streak</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <Heart className="w-12 h-12 mx-auto mb-2 text-blue-500 animate-pulse" />
                <p className="text-2xl font-bold text-slate-800">{activityStats.totalMoodEntries}</p>
                <p className="text-sm text-slate-600">Mood Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-green-500 animate-pulse" />
                <p className="text-2xl font-bold text-slate-800">{activityStats.totalJournalEntries}</p>
                <p className="text-sm text-slate-600">Journal Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-purple-500 animate-pulse" />
                <p className="text-2xl font-bold text-slate-800">{activityStats.averageMood.toFixed(1)}</p>
                <p className="text-sm text-slate-600">Avg Mood</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center mb-8 transition-all duration-500 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <Sun className="w-6 h-6 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            Daily Affirmation
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <p className="text-2xl text-slate-700 italic leading-relaxed animate-pulse">
              "{affirmation}"
            </p>
          </div>
          <button
            onClick={fetchNewAffirmation}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <Sun className="w-5 h-5" />
            New Affirmation
          </button>
        </div>

        {/* Enhanced Relaxation Timer */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center transition-all duration-500 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            5-Minute Guided Relaxation
          </h2>
          <div className="max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{
                    transform: `scale(${isRelaxationActive ? 1.1 : 1})`,
                    opacity: isRelaxationActive ? 0.3 : 0.1
                  }}
                ></div>
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-slate-800">{formatTime(relaxationTime)}</p>
                  <p className="text-sm text-slate-600">
                    {isRelaxationActive ? 'Breathe deeply...' : 'Ready to relax?'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              {!isRelaxationActive ? (
                <button
                  onClick={startRelaxation}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Session
                </button>
              ) : (
                <button
                  onClick={pauseRelaxation}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              )}
              <button
                onClick={resetRelaxation}
                className="bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
            <div className="mt-6 text-sm text-slate-600 leading-relaxed">
              {isRelaxationActive ? (
                <p className="animate-pulse">Focus on your breathing. Inhale slowly through your nose, hold for a moment, then exhale through your mouth.</p>
              ) : (
                <p>Take a moment to center yourself with a guided breathing exercise. Find a comfortable position and let your mind relax.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <SoundPlayer src="/sounds/paper-rustle.mp3" />
    </div>
  );
}