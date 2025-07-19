"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Gamepad2, Library, BookOpen, User, Heart, TrendingUp, TrendingDown, Minus, Calendar, Clock, Zap, Moon, Sun, Activity, Target, ChevronUp, ChevronDown, Brain, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';

interface MoodEntry {
  id: string;
  mood: number;
  notes?: string;
  date: string;
  triggers?: string[];
  activities?: string[];
  sleepHours?: number;
  energyLevel?: number;
}

interface MoodAnalytics {
  currentAverage: number;
  previousAverage: number;
  trend: 'improving' | 'declining' | 'stable';
  totalEntries: number;
}

interface MoodInsights {
  moodData: Array<{
    date: string;
    mood: number;
    energyLevel?: number;
    sleepHours?: number;
  }>;
  insights: {
    moodFrequency: Record<number, number>;
    commonTriggers: Array<[string, number]>;
    bestActivities: Array<[string, number]>;
    averageMood: number;
  };
}

const MoodPage = () => {
  const [mood, setMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState(8);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const moodEmojis = [
    { value: 1, emoji: '😭', label: 'Terrible', color: '#ef4444', className: '' },
    { value: 2, emoji: '😢', label: 'Very Sad', color: '#f97316', className: '' },
    { value: 3, emoji: '😔', label: 'Sad', color: '#eab308', className: '' },
    { value: 4, emoji: '😕', label: 'Down', color: '#84cc16', className: '' },
    { value: 5, emoji: '😐', label: 'Neutral', color: '#06b6d4', className: '' },
    { value: 6, emoji: '🙂', label: 'Okay', color: '#3b82f6', className: '' },
    { value: 7, emoji: '😊', label: 'Good', color: '#8b5cf6', className: '' },
    { value: 8, emoji: '😄', label: 'Great', color: '#10b981', className: '' },
    { value: 9, emoji: '😃', label: 'Amazing', color: '#059669', className: '' },
    { value: 10, emoji: '🤩', label: 'Incredible', color: '#047857', className: '' },
  ];

  const commonTriggers = [
    'Work stress', 'Relationship issues', 'Health concerns', 'Financial worry',
    'Social anxiety', 'Sleep problems', 'Weather', 'News/media',
    'Family issues', 'Academic pressure', 'Loneliness', 'Overwhelm'
  ];

  const commonActivities = [
    'Exercise', 'Meditation', 'Reading', 'Music', 'Nature walk',
    'Therapy session', 'Social time', 'Creative work', 'Rest',
    'Journaling', 'Cooking', 'Gaming', 'Learning', 'Volunteering'
  ];

  useEffect(() => {
    fetchMoodData();
    fetchInsights();
  }, []);

  useEffect(() => {
    if (insights && canvasRef.current) {
      drawMoodChart();
    }
  }, [insights]);

  const fetchMoodData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (!token) {
        setError('You are not logged in. Please log in to track your mood.');
        setIsLoading(false);
        return;
      }
      const response = await fetch('/api/mood', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.data);
        setAnalytics(data.analytics);

        if (data.analytics.currentAverage < 4) {
          const suggestions = [
            'Your mood has been low lately. Consider reaching out to a mental health professional.',
            'Try the breathing exercises in our Games section for immediate relief.',
            'Physical activity can significantly boost mood - even a 10-minute walk helps.',
            'Journaling about your feelings might help you process difficult emotions.',
            'Consider establishing a consistent sleep routine to improve your baseline mood.'
          ];
          setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
        } else if (data.analytics.trend === 'improving') {
          setSuggestion("Great progress! Your mood trend is improving. Keep up the positive practices that are working for you.");
        }
      } else {
        // Handle invalid/expired token
        if (response.status === 401) {
          setError('Session expired or invalid. Please log in again.');
        } else {
          setError('Failed to load mood data');
        }
      }
    } catch (error) {
      setError('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (!token) {
        setError('You are not logged in. Please log in to view insights.');
        return;
      }
      const response = await fetch('/api/mood/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data);
      } else if (response.status === 401) {
        setError('Session expired or invalid. Please log in again.');
      }
    } catch (error) {
      console.error('Failed to fetch insights');
    }
  };

  const drawMoodChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !insights) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(147, 197, 253, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const data = [...insights.moodData.slice(-14)].reverse();
    if (data.length < 2) return;

    const xStep = (width - 2 * padding) / (data.length - 1);
    const yScale = (height - 2 * padding) / 9;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 9; i++) {
      const y = height - padding - (i * yScale);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw smooth mood curve (Bezier)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = padding + (i * xStep);
      const y = height - padding - ((data[i].mood - 1) * yScale);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Calculate control points for Bezier curve
        const prevX = padding + ((i - 1) * xStep);
        const prevY = height - padding - ((data[i - 1].mood - 1) * yScale);
        const cp1X = prevX + xStep / 2;
        const cp1Y = prevY;
        const cp2X = x - xStep / 2;
        const cp2Y = y;
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x, y);
      }
    }
    ctx.stroke();

    // Draw points
    data.forEach((point, index) => {
      const x = padding + (index * xStep);
      const y = height - padding - ((point.mood - 1) * yScale);
      ctx.fillStyle = moodEmojis.find(e => e.value === Math.round(point.mood))?.color || '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      // Add mood emoji (no animation)
      const emoji = moodEmojis.find(e => e.value === Math.round(point.mood))?.emoji || '😐';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, x, y - 15);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuggestion('');

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood,
          notes,
          triggers,
          activities,
          sleepHours,
          energyLevel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.updated) {
          setError('Mood entry updated for today!');
        }
        setMood(5);
        setNotes('');
        setTriggers([]);
        setActivities([]);
        setSleepHours(8);
        setEnergyLevel(5);
        fetchMoodData();
        fetchInsights();

        if (mood < 4) {
          setSuggestion('Your mood seems low. Consider trying our relaxation games or reaching out for support.');
        } else if (mood >= 8) {
          setSuggestion('Great mood! Consider what contributed to feeling good today and try to replicate it.');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save mood');
      }
    } catch (error) {
      setError('Something went wrong');
    }
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const toggleActivity = (activity: string) => {
    setActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const currentMoodData = moodEmojis.find(e => e.value === mood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
      <EmergencySupport />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 drop-shadow-lg">Mood Tracker</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your emotional wellbeing with detailed insights and personalized recommendations
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-green-600 font-semibold text-lg">🔐</span>
            <span className="text-green-700 text-base font-medium">Your entries are private and encrypted</span>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Average</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.currentAverage.toFixed(1)}</p>
                </div>
                <div className={`p-3 rounded-full ${analytics.currentAverage >= 6 ? 'bg-green-100' : analytics.currentAverage >= 4 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  <Activity className={`w-6 h-6 ${analytics.currentAverage >= 6 ? 'text-green-600' : analytics.currentAverage >= 4 ? 'text-yellow-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trend</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{analytics.trend}</p>
                </div>
                <div className={`p-3 rounded-full ${analytics.trend === 'improving' ? 'bg-green-100' : analytics.trend === 'declining' ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {analytics.trend === 'improving' ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : analytics.trend === 'declining' ? (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  ) : (
                    <Minus className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalEntries}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{entries.length > 0 ? `${entries.length} days` : '0 days'}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Entry Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              How are you feeling today?
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Current Mood
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {moodEmojis.map((emoji) => (
                    <button
                      key={emoji.value}
                      type="button"
                      onClick={() => setMood(emoji.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${mood === emoji.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                        } ${emoji.className}`}
                      style={{
                        backgroundColor: mood === emoji.value ? `${emoji.color}20` : 'transparent'
                      }}
                    >
                      <div className="text-3xl mb-2">{emoji.emoji}</div>
                      <div className="text-xs text-gray-600">{emoji.label}</div>
                    </button>
                  ))}
                </div>
                {currentMoodData && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{currentMoodData.emoji}</div>
                      <div>
                        <p className="font-medium text-gray-900">You're feeling {currentMoodData.label}</p>
                        <p className="text-sm text-gray-600">On a scale of 1-10: {mood}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Energy Level: {energyLevel}/10
                </label>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-medium text-gray-600 w-8">{energyLevel}</span>
                </div>
              </div>

              {/* Sleep Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sleep Hours: {sleepHours}h
                </label>
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm font-medium text-gray-600 w-12">{sleepHours}h</span>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                  {/* Triggers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What might have influenced your mood today?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {commonTriggers.map((trigger) => (
                        <button
                          key={trigger}
                          type="button"
                          onClick={() => toggleTrigger(trigger)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${triggers.includes(trigger)
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {trigger}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What activities did you do today?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {commonActivities.map((activity) => (
                        <button
                          key={activity}
                          type="button"
                          onClick={() => toggleActivity(activity)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activities.includes(activity)
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your day? Any specific thoughts or events you'd like to remember?"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                Save Mood Entry
              </button>
            </form>

            {/* Messages */}
            {error && (
              <div className={`mt-4 p-4 rounded-lg ${error.includes('updated') ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {error}
              </div>
            )}

            {suggestion && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Personalized Suggestion</p>
                    <p className="text-green-700 text-sm mt-1">{suggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts and Analytics */}
          <div className="space-y-6">
            {/* Mood Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                14-Day Mood Trend
              </h3>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={300}
                  className="w-full h-auto rounded-lg"
                />
                {(!insights || insights.moodData.length < 2) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Add more entries to see your trend</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {insights && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Your Insights
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Average Mood</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(insights.insights.averageMood / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {insights.insights.averageMood.toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  {insights.insights.commonTriggers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Most Common Triggers</h4>
                      <div className="space-y-2">
                        {insights.insights.commonTriggers.slice(0, 3).map(([trigger, count]) => (
                          <div key={trigger} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{trigger}</span>
                            <span className="text-gray-500">{count} times</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.insights.bestActivities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Helpful Activities</h4>
                      <div className="space-y-2">
                        {insights.insights.bestActivities.slice(0, 3).map(([activity, count]) => (
                          <div key={activity} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{activity}</span>
                            <span className="text-green-600">{count} times</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Entries */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Recent Entries
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {entries.slice(0, 5).map((entry) => {
                  const entryMood = moodEmojis.find(e => e.value === Math.round(entry.mood));
                  return (
                    <div key={entry.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl">{entryMood?.emoji || '😐'}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{entryMood?.label || 'Neutral'}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {entries.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No entries yet. Start by logging your first mood!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;