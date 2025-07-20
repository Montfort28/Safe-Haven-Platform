'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, BookOpen, User, Home, BarChart3, Gamepad2, Library, Plus, TrendingUp, Sun, Flame, Play, Brain, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { formatDate } from '@/lib/utils';
import SoundPlayer from '@/components/SoundPlayer';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';

interface User {
  id: string;
  username: string;
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

// Remove chart constants, use only actual stats from API
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
  // All state variables and router at the top
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [moodData, setMoodData] = useState<MoodData[]>([]);
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
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>("inhale");

  useEffect(() => {
    let breathInterval: NodeJS.Timeout | undefined;
    if (isRelaxationActive) {
      breathInterval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === "inhale") return "hold";
          if (prev === "hold") return "exhale";
          return "inhale";
        });
      }, 4000);
    } else {
      setBreathPhase("inhale");
    }
    return () => {
      if (breathInterval) clearInterval(breathInterval);
    };
  }, [isRelaxationActive]);

  // ...existing code...

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

      // Fetch mood analytics (for graph and stats)
      const moodAnalyticsRes = await fetch('/api/mood/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let moodAnalytics = null;
      let moodEntries: any[] = [];
      if (moodAnalyticsRes.ok) {
        const moodAnalyticsJson = await moodAnalyticsRes.json();
        moodAnalytics = moodAnalyticsJson.data;
        moodEntries = moodAnalytics?.moodData || [];
        // Sort mood entries by date ascending
        moodEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Format for chart
        setMoodData(
          moodEntries.map((entry: any) => ({
            day: formatDate(entry.date),
            mood: entry.mood,
            date: entry.date
          }))
        );
        // Suggestion logic (for the old suggestion, but new card will use a new one)
        if (moodEntries.length > 0) {
          const avgMood = moodEntries.reduce((sum: number, entry: any) => sum + entry.mood, 0) / moodEntries.length;
          if (avgMood < 4) {
            const suggestions = [
              'Your mood seems low. Try nurturing your Mind Garden to feel more grounded.',
              'Feeling down? Play a relaxing game to lift your spirits.',
              'Consider writing in your journal to express your thoughts.',
              'Explore our resources for coping strategies.',
            ];
            setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
          } else {
            setSuggestion('');
          }
        } else {
          setSuggestion('');
        }
      }

      // Fetch journal entries (for stats and recent)
      const journalResponse = await fetch('/api/journal?limit=3', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let journalEntries: any[] = [];
      if (journalResponse.ok) {
        const journalData = await journalResponse.json();
        journalEntries = journalData.data || [];
        setRecentEntries(journalEntries);
      }

      // Fetch streak and stats (from games/stats or mood/analytics)
      let streak = 0;
      if (moodAnalytics && typeof moodAnalytics.streak === 'number') {
        streak = moodAnalytics.streak;
      } else {
        // fallback to games stats if available
        const statsResponse = await fetch('/api/games/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          streak = statsData.data.streak || 0;
        }
      }

      // Calculate average mood
      const averageMood = moodEntries.length > 0
        ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
        : 0;

      setActivityStats({
        streak: moodEntries.length > 0 && streak === 0 && moodAnalytics && typeof moodAnalytics.streak !== 'number' ? 1 : streak,
        totalMoodEntries: moodEntries.length,
        totalJournalEntries: journalEntries.length,
        averageMood,
      });

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
      <EmergencySupport />
      <SoundPlayer src="/sounds/ambient-rain.mp3" loop />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className={`mb-8 transition-all duration-1000 ${showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h1 className="text-4xl font-bold text-slate-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.username || user?.name}!
            </h1>
            <p className="text-slate-600 text-lg mb-4">
              This is your wellness page. Here you can see how you're feeling, write about your day, and take care of your mind.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">📊 View mood trends</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">📝 Journal entries</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">🎮 Wellness games</span>
              <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">🌱 Mind garden</span>
            </div>
            {/* Personalized Feedback & Motivation */}
            <div className="mt-6">
              {activityStats.totalJournalEntries >= 3 && (
                <div className="mb-3 p-4 bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2 animate-fade-in">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  You've journaled {activityStats.totalJournalEntries} times this week — keep it going!
                </div>
              )}
              {activityStats.totalMoodEntries > 0 && moodData.slice(-4).every(entry => entry.mood <= 4) && (
                <div className="mb-3 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl text-blue-700 font-semibold flex items-center gap-2 animate-fade-in">
                  <Heart className="w-5 h-5 text-blue-500 animate-pulse" />
                  You marked feeling anxious 4 days in a row. Here's a <Link href="/games" className="underline text-blue-600">breathing game</Link> to help you relax.
                </div>
              )}
              {activityStats.streak >= 5 && (
                <div className="mb-3 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-xl text-yellow-700 font-semibold flex items-center gap-2 animate-fade-in">
                  <TrendingUp className="w-5 h-5 text-orange-500 animate-pulse" />
                  Amazing streak! {activityStats.streak} days in a row. Consistency builds resilience.
                </div>
              )}
              {activityStats.averageMood >= 8 && (
                <div className="mb-3 p-4 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-xl text-purple-700 font-semibold flex items-center gap-2 animate-fade-in">
                  <Sun className="w-5 h-5 text-yellow-500 animate-pulse" />
                  Your average mood is high! Keep doing what works for you.
                </div>
              )}
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

        {/* Average Mood & Personalized Suggestion Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-200 flex flex-col items-center justify-center w-full lg:col-span-3">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-purple-500" />
              Average Mood
            </h2>
            <div className="text-6xl font-extrabold text-purple-700 mb-2">{activityStats.averageMood.toFixed(1)}</div>
            <div className="text-lg text-slate-600 mb-2">Based on your recent entries</div>
            <div className="w-full mt-6">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 shadow border border-purple-100 text-center">
                <h3 className="text-xl font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-purple-700" />
                  Personalized Suggestion
                </h3>
                <p className="text-slate-700 text-lg">
                  {(() => {
                    const avg = activityStats.averageMood;
                    if (avg === 0) return 'Log your mood to get a simple tip!';
                    if (avg < 3) return 'You seem down. Try talking to someone you trust or do something you enjoy.';
                    if (avg < 5) return 'Try to get good sleep and take small breaks. It can help you feel better.';
                    if (avg < 7) return 'You are doing okay! Keep up your daily habits and maybe try something new.';
                    if (avg < 8.5) return 'You are doing well! Keep your good habits and remember to relax.';
                    return 'Great job! Keep smiling and enjoy your day!';
                  })()}
                </p>
              </div>
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
        

        {/* Enhanced Daily Affirmation */}
        <div className="relative bg-gradient-to-br from-yellow-100 via-purple-100 to-blue-100 rounded-3xl p-8 shadow-2xl border border-purple-200 text-center mb-8 transition-all duration-500 hover:shadow-3xl hover:scale-[1.03] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-yellow-300 to-purple-300 rounded-full blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-2">
            <Sun className="w-8 h-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            Daily Affirmation
          </h2>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 mb-6 shadow-lg border border-purple-100">
            <p className="text-2xl text-purple-700 italic font-semibold leading-relaxed animate-pulse">
              "{affirmation}"
            </p>
          </div>
          <button
            onClick={fetchNewAffirmation}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            <Sun className="w-4 h-4 inline-block mr-1" />
            New Affirmation
          </button>
        </div>

        {/* Enhanced Relaxation Timer */}
        <div className="relative bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 text-center transition-all duration-700 hover:shadow-3xl hover:scale-[1.03] overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow"></div>
            5-Minute Guided Relaxation
          </h2>
          <div className="max-w-md mx-auto">
            <div className="relative mb-8 flex flex-col items-center">
              {/* Animated Breathing Circle */}
              <div className="relative w-40 h-40 mx-auto">
                <div
                  className={`inset-0 rounded-full bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 transition-all duration-700 absolute`}
                  style={{
                    transform: isRelaxationActive
                      ? breathPhase === 'inhale'
                        ? 'scale(1.18)'
                        : breathPhase === 'hold'
                          ? 'scale(1.05)'
                          : 'scale(0.85)'
                      : 'scale(1)',
                    opacity: isRelaxationActive ? 0.4 : 0.15
                  }}
                ></div>
                <div className="inset-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center absolute overflow-hidden">
                  <div className="relative z-10 text-center">
                    <p className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent animate-number-glow">
                      {formatTime(relaxationTime)}
                    </p>
                    <p className="text-xs font-medium text-slate-600 mt-1 animate-fade-in-out">
                      {isRelaxationActive ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          {breathPhase === 'inhale' ? 'Inhale deeply...' : breathPhase === 'hold' ? 'Hold your breath...' : 'Exhale slowly...'}
                        </span>
                      ) : (
                        'Ready to relax?'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              {!isRelaxationActive ? (
                <button
                  onClick={startRelaxation}
                  className="group relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Play className="w-6 h-6 animate-pulse" />
                  <span>Start Session</span>
                </button>
              ) : (
                <button
                  onClick={pauseRelaxation}
                  className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Pause className="w-6 h-6 animate-pulse" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={resetRelaxation}
                className="group relative bg-gradient-to-r from-slate-500 via-gray-600 to-zinc-600 hover:from-slate-600 hover:via-gray-700 hover:to-zinc-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                <span>Reset</span>
              </button>
            </div>
            <div className="relative bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-inner mt-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-slate-700">Breathing Guide</h3>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed">
                {isRelaxationActive ? (
                  <div className="space-y-3">
                    <p className="animate-breathing-text font-medium text-slate-700">
                      🌊 Focus on your breathing rhythm
                    </p>
                    <div className="flex justify-center items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Inhale 4s</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <span>Hold 4s</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
                        <span>Exhale 4s</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 animate-fade-in-out">
                      Let your mind drift away from daily worries...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-medium text-slate-700">
                      🧘‍♀️ Take a moment to center yourself
                    </p>
                    <p className="text-xs text-slate-500">
                      This exercise helps reduce stress, improve focus, and promote emotional balance. Find a comfortable position and let your mind relax. This guided breathing exercise will help you achieve a state of calm and tranquility.
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SoundPlayer src="/sounds/paper-rustle.mp3" />
      <style jsx>{`
        @keyframes breath-expand {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.15); }
          100% { transform: scale(0.9); }
        }
        @keyframes breath-contract {
          0% { transform: scale(1.15); }
          50% { transform: scale(0.9); }
          100% { transform: scale(1.15); }
        }
        .animate-breath-expand {
          animation: breath-expand 4s infinite;
        }
        .animate-breath-contract {
          animation: breath-contract 4s infinite;
        }
      `}</style>
    </div>
  );
}