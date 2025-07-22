'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, BarChart3, Gamepad2, Library, BookOpen, User, Heart,
  Plus, Clock, Flame, Lightbulb, Target, Smile, Frown, Meh,
  Sun, Moon, Cloud, CloudRain, Zap, Mic, MicOff, Save,
  Sparkles, TrendingUp, Calendar, Quote, Brain, Pause, Play,
  Volume2, VolumeX, RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import SoundPlayer from '@/components/SoundPlayer';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';

// Fallback getCurrentTime function if not defined in utils
const getCurrentTime = (timeZone: string = 'UTC'): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { timeZone, hour12: true });
};

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: number;
  tags?: string[];
  gratitude?: string[];
  goals?: string[];
  emotions?: string[];
}

interface JournalPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'mindfulness';
}

const JOURNAL_PROMPTS: JournalPrompt[] = [
  { id: '1', text: 'What made me smile today?', category: 'gratitude' },
  { id: '2', text: 'What challenge did I overcome recently?', category: 'growth' },
  { id: '3', text: 'How am I feeling right now, and why?', category: 'mindfulness' },
  { id: '4', text: 'What am I most grateful for today?', category: 'gratitude' },
  { id: '5', text: 'What would I tell my younger self?', category: 'reflection' },
  { id: '6', text: 'What positive change do I want to make?', category: 'growth' },
  { id: '7', text: 'What brought me peace today?', category: 'mindfulness' },
  { id: '8', text: 'How did I show kindness today?', category: 'reflection' },
];

const MOOD_ICONS = {
  1: { icon: '😢', color: 'text-red-500', bg: 'bg-red-100' },
  2: { icon: '😟', color: 'text-red-400', bg: 'bg-red-100' },
  3: { icon: '😕', color: 'text-orange-500', bg: 'bg-orange-100' },
  4: { icon: '😐', color: 'text-orange-400', bg: 'bg-orange-100' },
  5: { icon: '😊', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  6: { icon: '😊', color: 'text-yellow-400', bg: 'bg-yellow-100' },
  7: { icon: '😄', color: 'text-green-500', bg: 'bg-green-100' },
  8: { icon: '😁', color: 'text-green-400', bg: 'bg-green-100' },
  9: { icon: '🤩', color: 'text-blue-500', bg: 'bg-blue-100' },
  10: { icon: '😍', color: 'text-purple-500', bg: 'bg-purple-100' },
};

const EMOTIONS = [
  'Happy', 'Sad', 'Anxious', 'Excited', 'Calm', 'Frustrated', 'Grateful',
  'Hopeful', 'Tired', 'Energetic', 'Peaceful', 'Overwhelmed', 'Content',
  'Motivated', 'Worried', 'Proud', 'Lonely', 'Loved', 'Stressed', 'Relaxed'
];

export default function JournalPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mood, setMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [gratitudeList, setGratitudeList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gratitudeList');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [goals, setGoals] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('goals');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [breathingMode, setBreathingMode] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  // Hydration fix: only show time after mount
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchJournalEntries();
    fetchStreak();
    setRandomPrompt();

    // Auto-save functionality
    const autoSaveInterval = setInterval(() => {
      if (autoSave && (title || content) && !isSaving) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, []);

  useEffect(() => {
    setWordCount(content.split(/\s+/).filter(word => word.length > 0).length);
  }, [content]);

  // Hydration fix: update last updated time on mount and every minute
  useEffect(() => {
    function updateTime() {
      setLastUpdated(getCurrentTime('CAT'));
    }
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (breathingMode) {
      const breathingInterval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          return 'inhale';
        });
      }, 4000);
      return () => clearInterval(breathingInterval);
    }
  }, [breathingMode]);

  const setRandomPrompt = () => {
    const randomPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setCurrentPrompt(randomPrompt);
  };

  const fetchJournalEntries = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/journal?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.data);
      } else {
        setError('Failed to load journal entries');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      const response = await fetch('/api/journal/streak', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStreak(data.data.streak || 0);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!title && !content) return;

    setIsSaving(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      await fetch('/api/journal/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, mood, emotions: selectedEmotions }),
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          mood,
          emotions: selectedEmotions,
          gratitude: gratitudeList,
          goals: goals
        }),
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setMood(null);
        setSelectedEmotions([]);
        setGratitudeList([]);
        setGoals([]);
        fetchJournalEntries();
        fetchStreak();
        setRandomPrompt();
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save entry');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(prev => prev + ' ' + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setError('Voice recognition error. Please try again.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      setError('Failed to start voice recognition');
    }
  };

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const addGratitudeItem = (item: string) => {
    if (item.trim() && !gratitudeList.includes(item.trim())) {
      const updated = [...gratitudeList, item.trim()];
      setGratitudeList(updated);
      if (typeof window !== 'undefined') localStorage.setItem('gratitudeList', JSON.stringify(updated));
    }
  };

  const addGoal = (goal: string) => {
    if (goal.trim() && !goals.includes(goal.trim())) {
      const updated = [...goals, goal.trim()];
      setGoals(updated);
      if (typeof window !== 'undefined') localStorage.setItem('goals', JSON.stringify(updated));
    }
  };
  // Persist gratitude and goals to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('gratitudeList', JSON.stringify(gratitudeList));
  }, [gratitudeList]);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const BreathingGuide = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center max-w-md">
        <h3 className="text-xl font-semibold mb-4">Breathing Exercise</h3>
        <div className={`w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-4000 ${breathingPhase === 'inhale' ? 'bg-blue-500 scale-110' :
          breathingPhase === 'hold' ? 'bg-yellow-500 scale-100' :
            'bg-green-500 scale-90'
          }`}>
          {breathingPhase === 'inhale' ? 'Breathe In' :
            breathingPhase === 'hold' ? 'Hold' : 'Breathe Out'}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Follow the circle to regulate your breathing
        </p>
        <button
          onClick={() => setBreathingMode(false)}
          className="btn-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowAllModal(false);
    }
  };


  // Mood Insights state from backend analytics
  const [moodStats, setMoodStats] = useState({ avg: 0, bestDay: '', commonEmotion: '', trend: 'constant' });

  useEffect(() => {
    const fetchMoodAnalytics = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        const res = await fetch('/api/mood/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const analytics = await res.json();
          const moodData = analytics.data?.moodData || [];
          // Only consider last 7 days for weekly insights
          const last7 = moodData.slice(-7);
          if (last7.length > 0) {

            const avg = last7.reduce((sum: number, e: MoodData) => sum + (e.mood || 0), 0) / last7.length;
            // Best day (highest mood)
            interface MoodData {
              mood: number;
              date: string;
            }
            const best: MoodData = last7.reduce(
              (a: MoodData, b: MoodData) => (a.mood > b.mood ? a : b),
              last7[0] as MoodData
            );
            // Most common mood (as emotion)
            interface MoodCounts {
              [mood: number]: number;
            }
            const moodCounts: MoodCounts = last7.reduce((acc: MoodCounts, e: { mood: number; date: string }) => {
              acc[e.mood] = (acc[e.mood] || 0) + 1;
              return acc;
            }, {} as MoodCounts);
            const common = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
            // Trend: compare first and last mood
            let trend = 'constant';
            if (last7.length > 1) {
              if (last7[last7.length - 1].mood > last7[0].mood) trend = 'improving';
              else if (last7[last7.length - 1].mood < last7[0].mood) trend = 'declining';
            }
            setMoodStats({ avg, bestDay: best.date, commonEmotion: common, trend });
          } else {
            setMoodStats({ avg: 0, bestDay: '', commonEmotion: '', trend: 'constant' });
          }
        }
      } catch (e) {
        setMoodStats({ avg: 0, bestDay: '', commonEmotion: '', trend: 'constant' });
      }
    };
    fetchMoodAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
      <EmergencySupport />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 drop-shadow-lg">Mindful Journal</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A safe space to express your thoughts, track your emotions, and reflect on your journey of growth.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-green-600 font-semibold text-lg">🔐</span>
            <span className="text-green-700 text-base font-medium">Your entries are private and encrypted</span>
          </div>
        </div>

        {/* Wellness Toolbar */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-400 shadow-lg hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 border-none flex items-center gap-2"
          >
            <Lightbulb className="w-5 h-5" />
            Writing Prompts
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-400 to-green-400 shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 border-none flex items-center gap-2`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {soundEnabled ? 'Sounds On' : 'Sounds Off'}
          </button>
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-400 to-purple-400 shadow-lg hover:from-purple-500 hover:to-blue-700 transition-all duration-300 border-none flex items-center gap-2`}
          >
            <Save className="w-5 h-5" />
            Auto-save {autoSave ? 'On' : 'Off'}
          </button>
        </div>

        {/* Writing Prompts */}
        {showPrompts && (
          <div className="glass-card p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
              <Sparkles className="w-5 h-5" />
              Daily Writing Prompts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JOURNAL_PROMPTS.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg cursor-pointer hover:shadow-md hover:bg-blue-200 transition-all"
                  onClick={() => {
                    setContent(prev => prev + '\n\n' + prompt.text + '\n\n');
                    setShowPrompts(false);
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      {prompt.category}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">{prompt.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Journal Entry */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 bg-white/80">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">New Entry</h2>
                <div className="flex items-center gap-2">
                  {isSaving && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
                  <span className="text-sm text-blue-500">
                    {isSaving ? 'Saving...' : autoSave ? 'Auto-save on' : 'Manual save'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 transition-all duration-300"
                    placeholder="Enter a title for your entry"
                    required
                  />
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    How are you feeling? (1-10)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(MOOD_ICONS).map(([value, { icon, color, bg }]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMood(Number(value))}
                        className={`p-3 rounded-lg transition-all ${mood === Number(value) ? 'bg-blue-200 ring-2 ring-offset-2 ring-blue-500' : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <div className="text-xs font-medium mt-1">{value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotion Tags */}
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    What emotions are you experiencing?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((emotion) => (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => handleEmotionToggle(emotion)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${selectedEmotions.includes(emotion)
                          ? 'bg-purple-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative">
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Your thoughts
                  </label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-5 py-4 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-gradient-to-br from-white via-blue-50 to-purple-50 shadow-inner transition-all duration-300 min-h-[220px] resize-vertical text-base leading-relaxed placeholder:text-blue-300"
                      placeholder={currentPrompt ? `${currentPrompt.text}\n\nStart writing your thoughts here...` : "Start writing your thoughts here..."}
                      rows={10}
                      spellCheck={true}
                      autoCorrect="on"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all ${isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-blue-600">
                      Words: {wordCount} | Characters: {content.length}
                    </p>
                    {/* Hydration fix: only render after mount */}
                    {lastUpdated && (
                      <p className="text-xs text-blue-400">
                        Last updated: {lastUpdated}
                      </p>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-purple-400 font-semibold">
                    {isSaving ? 'Auto-saving...' : autoSave ? 'Auto-save enabled' : 'Manual save'}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary w-full flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Tracker */}
            <div className="glass-card p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-600">
                <Flame className="w-5 h-5 text-orange-500" />
                Writing Streak
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">{streak}</div>
                <div className="text-sm text-orange-600 mb-4">
                  {streak === 1 ? 'day' : 'days'} in a row
                </div>
                <div className="w-full bg-orange-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-orange-400 mt-2">
                  Goal: 30 days
                </div>
              </div>
            </div>

            {/* Gratitude Section */}
            <div className="glass-card p-6 bg-gradient-to-r from-pink-50 to-purple-50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-600">
                <Heart className="w-5 h-5 text-pink-500" />
                Daily Gratitude
              </h3>
              <div className="space-y-3">
                {gratitudeList.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-pink-100 rounded-lg">
                    <span className="text-pink-500">•</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add something you're grateful for..."
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/70 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addGratitudeItem(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            {/* Goals Section */}
            <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                <Target className="w-5 h-5 text-blue-500" />
                Today's Goals
              </h3>
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-500">→</span>
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add a goal for today..."
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addGoal(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            {/* Mood Insights (from backend analytics) */}
            <div className="glass-card p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Mood Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This week's average</span>
                  <span className="font-semibold text-green-600">{moodStats.avg ? moodStats.avg.toFixed(1) : '--'}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best day</span>
                  <span className="font-semibold text-blue-600">{moodStats.bestDay ? formatDate(moodStats.bestDay) : '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most common mood</span>
                  <span className="font-semibold text-purple-600">{moodStats.commonEmotion || '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trend</span>
                  <span className="font-semibold">
                    {moodStats.trend === 'improving' && <Smile className="inline w-5 h-5 text-green-500" />}
                    {moodStats.trend === 'declining' && <Frown className="inline w-5 h-5 text-red-500" />}
                    {moodStats.trend === 'constant' && <Meh className="inline w-5 h-5 text-yellow-500" />}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="glass-card p-8 mt-12 bg-white/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Recent Entries</h2>
            <button
              className="text-blue-600 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 border border-blue-200 bg-white/70 shadow-sm"
              onClick={() => setShowAllModal(true)}
            >
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.slice(0, 6).map((entry) => (
                <div
                  key={entry.id}
                  className="group bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50"
                  onClick={() => setShowAllModal(true)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-black line-clamp-1 group-hover:text-purple-600 transition-colors text-lg">{entry.title}</h3>
                    {entry.mood && (
                      <span className="text-lg">
                        {MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]?.icon}
                      </span>
                    )}
                  </div>

                  <p className="text-base text-gray-700 mb-3 line-clamp-3">
                    {entry.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                  </p>

                  {entry.emotions && entry.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.emotions.slice(0, 3).map((emotion, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                        >
                          {emotion}
                        </span>
                      ))}
                      {entry.emotions.length > 3 && (
                        <span className="text-xs text-blue-500 font-medium">+{entry.emotions.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.content.split(' ').length} words
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-200" />
              <p className="text-gray-400 mb-4 text-lg">No journal entries yet</p>
              <p className="text-base text-gray-300 mb-6">
                Start your mindful journaling journey by writing your first entry above
              </p>
              <button
                onClick={() => (document.querySelector('input[type="text"]') as HTMLInputElement | null)?.focus()}
                className="btn-primary inline-flex items-center text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Writing
              </button>
            </div>
          )}
        </div>

        {/* Modal for all entries */}
        {showAllModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 backdrop-blur-md" onClick={handleModalClick}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 relative animate-fade-in border-2 border-blue-300 overflow-hidden" style={{ zIndex: 10000 }}>
              <div className="flex flex-col">
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-blue-100">
                  <h2 className="text-3xl font-bold text-blue-700 text-center w-full">All Journal Entries</h2>
                  <button
                    className="absolute top-6 right-6 text-blue-600 hover:text-red-500 text-2xl font-bold"
                    onClick={() => setShowAllModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-8 pb-8 pt-4">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.id} className="bg-white rounded-xl p-6 mb-6 shadow-md border-l-4 border-blue-500">
                        <h3 className="font-bold text-black text-xl mb-2">{entry.title}</h3>
                        <p className="text-base text-gray-700 mb-2">{entry.content.replace(/<[^>]+>/g, '')}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {entry.content.split(' ').length} words
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-200" />
                      <p className="text-gray-400 mb-4 text-lg">No journal entries found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {soundEnabled && <SoundPlayer src="/sounds/paper-rustle.mp3" loop={true} />}
    </div>
  );
}