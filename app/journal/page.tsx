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
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
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
      setGratitudeList(prev => [...prev, item.trim()]);
    }
  };

  const addGoal = (goal: string) => {
    if (goal.trim() && !goals.includes(goal.trim())) {
      setGoals(prev => [...prev, goal.trim()]);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 animate-fade-in">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Mindful Journal</h1>
          <p className="text-blue-600 max-w-2xl mx-auto">
            A safe space to express your thoughts, track your emotions, and reflect on your journey of growth.
          </p>
        </div>

        {/* Wellness Toolbar */}
        <div className="glass-card p-4 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="btn-secondary flex items-center gap-2 hover:bg-blue-100 hover:text-blue-700"
            >
              <Lightbulb className="w-4 h-4" />
              Writing Prompts
            </button>
            <button
              onClick={() => setBreathingMode(true)}
              className="btn-secondary flex items-center gap-2 hover:bg-blue-100 hover:text-blue-700"
            >
              <Brain className="w-4 h-4" />
              Breathing Exercise
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-secondary flex items-center gap-2 hover:bg-blue-100 hover:text-blue-700"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Sounds On' : 'Sounds Off'}
            </button>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`btn-secondary flex items-center gap-2 ${autoSave ? 'bg-green-100' : ''} hover:bg-blue-100 hover:text-blue-700`}
            >
              <Save className="w-4 h-4" />
              Auto-save {autoSave ? 'On' : 'Off'}
            </button>
          </div>
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
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 transition-all duration-300 min-h-[200px] resize-none"
                      placeholder={currentPrompt ? `${currentPrompt.text}\n\nStart writing your thoughts here...` : "Write your thoughts here..."}
                      rows={8}
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
                    <p className="text-xs text-blue-400">
                      Last updated: {getCurrentTime('CAT')}
                    </p>
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-600">
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
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

            {/* Mood Insights */}
            <div className="glass-card p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Mood Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This week's average</span>
                  <span className="font-semibold text-green-600">7.2/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Best day</span>
                  <span className="font-semibold text-blue-600">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most common emotion</span>
                  <span className="font-semibold text-purple-600">Grateful</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="glass-card p-8 mt-12 bg-white/80">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-blue-700">Recent Entries</h2>
            <Link href="/journal/all" className="text-blue-600 hover:text-purple-600 text-sm">
              View All →
            </Link>
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
                  className="group bg-blue-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500 cursor-pointer"
                  onClick={() => router.push(`/journal/${entry.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-700 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {entry.title}
                    </h3>
                    {entry.mood && (
                      <span className="text-lg">
                        {MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]?.icon}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-blue-600 mb-3 line-clamp-3">
                    {entry.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                  </p>

                  {entry.emotions && entry.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.emotions.slice(0, 3).map((emotion, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {emotion}
                        </span>
                      ))}
                      {entry.emotions.length > 3 && (
                        <span className="text-xs text-blue-500">+{entry.emotions.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-blue-400">
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
              <p className="text-blue-400 mb-4">No journal entries yet</p>
              <p className="text-sm text-blue-300 mb-6">
                Start your mindful journaling journey by writing your first entry above
              </p>
              <button
                onClick={() => (document.querySelector('input[type="text"]') as HTMLInputElement | null)?.focus()}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Writing
              </button>
            </div>
          )}
        </div>
      </div>

      {soundEnabled && <SoundPlayer src="/sounds/paper-rustle.mp3" loop={true} />}
    </div>
  );
}