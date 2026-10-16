'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaHeart as Heart,
  FaBookOpen as BookOpen,
  FaGamepad as Gamepad2,
  FaArrowTrendUp as TrendingUp,
  FaSun as Sun,
  FaFire as Flame,
  FaPlay as Play,
  FaPause as Pause,
  FaRotate as RotateCcw,
  FaSeedling as GardenIcon,
  FaArrowRight as ArrowRight,
} from 'react-icons/fa6';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
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
  const [moodData, setMoodData] = useState<MoodData[]>([]);
  const getLast7DaysMoodData = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        day: formatDate(d.toISOString()),
        date: d.toISOString().split('T')[0],
      });
    }
    // Map moodData by date for quick lookup
    const moodByDate = Object.fromEntries(moodData.map(entry => [entry.date.split('T')[0], entry]));
    // Fill days with mood if exists, else use previous mood value
    let lastMood: number | null = null;
    return days.map(dayObj => {
      const moodEntry = moodByDate[dayObj.date];
      if (moodEntry) {
        lastMood = moodEntry.mood;
        return {
          day: dayObj.day,
          date: dayObj.date,
          mood: moodEntry.mood,
        };
      } else {
        return {
          day: dayObj.day,
          date: dayObj.date,
          mood: lastMood,
        };
      }
    });
  };
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

      const authorization = { Authorization: `Bearer ${token}` };
      const [userResponse, moodAnalyticsRes, journalResponse, streakResponse] = await Promise.all([
        fetch('/api/user/profile', { headers: authorization }),
        fetch('/api/mood/analytics', { headers: authorization }),
        fetch('/api/journal?limit=3', { headers: authorization }),
        fetch('/api/journal/streak', { headers: authorization }),
      ]);

      let totalJournalEntries = 0;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data);
        totalJournalEntries = userData.data?.journalEntries ?? 0;
      }

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

      let journalEntries: any[] = [];
      if (journalResponse.ok) {
        const journalData = await journalResponse.json();
        journalEntries = journalData.data || [];
        setRecentEntries(journalEntries);
      }

      let streak = 0;
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        streak = streakData.data?.streak || 0;
      }

      // Calculate average mood
      const averageMood = moodEntries.length > 0
        ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
        : 0;

      setActivityStats({
        streak,
        totalMoodEntries: moodEntries.length,
        totalJournalEntries,
        averageMood,
      });

      void fetchNewAffirmation();
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
    const timer = setInterval(async () => {
      setRelaxationTime(prev => {
        if (prev <= 1) {
          setIsRelaxationActive(false);
          clearInterval(timer);
          // Record meditation session when relaxation completes
          recordMeditationSession(300, 'breathing');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    setRelaxationTimer(timer);
  };

  // Record meditation session (breathing exercise)
  const recordMeditationSession = async (duration: number, type: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (!token) return;
      await fetch('/api/meditation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration, type }),
      });
      // Optionally refresh dashboard data to update stats
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to record meditation session:', error);
    }
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
    <div className="member-app dashboard-page">
      <EmergencySupport />
      <SoundPlayer src="/sounds/ambient-rain.mp3" loop />
      <Navbar />

      <main className="dashboard-content">
        <header className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">Your wellbeing space</span>
            <h1>
              Welcome <span className="member-heading-accent">back</span>
              {user?.name || user?.username ? `, ${user.name || user.username}` : '.'}
            </h1>
            <p>A calm place to check in, reflect, and choose what feels helpful today.</p>
          </div>
          <Link href="/mood" className="dashboard-primary-action">
            <Heart aria-hidden="true" />
            Check in with your mood
          </Link>
        </header>

        <section className="dashboard-stat-grid" aria-label="Your wellbeing overview">
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon"><Flame aria-hidden="true" /></span>
            <span className="dashboard-stat-label">Current streak</span>
            <strong>{activityStats.streak}<small> days</small></strong>
            <span className="dashboard-stat-note">A little care, day by day</span>
          </article>
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon"><Heart aria-hidden="true" /></span>
            <span className="dashboard-stat-label">Mood check-ins</span>
            <strong>{activityStats.totalMoodEntries}</strong>
            <span className="dashboard-stat-note">Moments you have checked in</span>
          </article>
          <article className="dashboard-stat-card">
            <span className="dashboard-stat-icon"><BookOpen aria-hidden="true" /></span>
            <span className="dashboard-stat-label">Journal entries</span>
            <strong>{activityStats.totalJournalEntries}</strong>
            <span className="dashboard-stat-note">Thoughts saved along the way</span>
          </article>
          <article className="dashboard-stat-card dashboard-stat-highlight">
            <span className="dashboard-stat-icon"><TrendingUp aria-hidden="true" /></span>
            <span className="dashboard-stat-label">Average mood</span>
            <strong>{activityStats.averageMood > 0 ? activityStats.averageMood.toFixed(1) : 'N/A'}<small>{activityStats.averageMood > 0 ? ' / 10' : ''}</small></strong>
            <span className="dashboard-stat-note">Based on your recent check-ins</span>
          </article>
        </section>

        {suggestion && (
          <aside className="dashboard-gentle-note">
            <span className="dashboard-note-icon"><Sun aria-hidden="true" /></span>
            <p>{suggestion}</p>
            <Link href="/resources">Explore support</Link>
          </aside>
        )}

        <section className="dashboard-main-grid" aria-label="Wellbeing tools">
          <article className="dashboard-card dashboard-mood-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="dashboard-eyebrow">A gentle look back</span>
                <h2>Your mood this week</h2>
              </div>
              <Link href="/mood" className="dashboard-text-link">View mood history</Link>
            </div>
            {moodData.length > 0 ? (
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getLast7DaysMoodData()} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardMoodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#97A87A" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#97A87A" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#44513D', fontSize: 12 }} />
                    <YAxis domain={[1, 10]} axisLine={false} tickLine={false} tick={{ fill: '#44513D', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="natural" dataKey="mood" stroke="#44513D" strokeWidth={2.5} fill="url(#dashboardMoodFill)" dot={{ fill: '#44513D', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#DB9558' }} connectNulls strokeLinecap="round" strokeLinejoin="round" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="dashboard-empty-chart">
                <p>Your mood journey will take shape as you add check-ins.</p>
                <Link href="/mood" className="dashboard-text-link">Add your first check-in <ArrowRight aria-hidden="true" /></Link>
              </div>
            )}
          </article>

          <article className="dashboard-card dashboard-actions-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="dashboard-eyebrow">Start where you are</span>
                <h2>What would help?</h2>
              </div>
            </div>
            <nav className="dashboard-action-list" aria-label="Quick wellbeing actions">
              <Link href="/mood" className="dashboard-action-link">
                <span className="dashboard-action-icon"><Heart aria-hidden="true" /></span>
                <span><strong>Log a mood</strong><small>Pause and notice how you feel</small></span>
                <ArrowRight className="dashboard-action-arrow" aria-hidden="true" />
              </Link>
              <Link href="/journal" className="dashboard-action-link">
                <span className="dashboard-action-icon"><BookOpen aria-hidden="true" /></span>
                <span><strong>Write in your journal</strong><small>Make space for your thoughts</small></span>
                <ArrowRight className="dashboard-action-arrow" aria-hidden="true" />
              </Link>
              <Link href="/mind-garden" className="dashboard-action-link">
                <span className="dashboard-action-icon"><GardenIcon aria-hidden="true" /></span>
                <span><strong>Visit your Mind Garden</strong><small>Grow at your own pace</small></span>
                <ArrowRight className="dashboard-action-arrow" aria-hidden="true" />
              </Link>
              <Link href="/games" className="dashboard-action-link">
                <span className="dashboard-action-icon"><Gamepad2 aria-hidden="true" /></span>
                <span><strong>Try a calming activity</strong><small>Take a gentle moment for yourself</small></span>
                <ArrowRight className="dashboard-action-arrow" aria-hidden="true" />
              </Link>
            </nav>
          </article>
        </section>

        <section className="dashboard-lower-grid" aria-label="Personal reflections and recent activity">
          <article className="dashboard-card dashboard-journal-card">
            <div className="dashboard-card-heading">
              <div>
                <span className="dashboard-eyebrow">Your reflections</span>
                <h2>Recent journal entries</h2>
              </div>
              <Link href="/journal" className="dashboard-text-link">Open journal</Link>
            </div>
            {recentEntries.length > 0 ? (
              <div className="dashboard-journal-list">
                {recentEntries.map(entry => (
                  <article key={entry.id} className="dashboard-journal-entry">
                    <span className="dashboard-journal-mark" aria-hidden="true"><BookOpen /></span>
                    <div>
                      <h3>{entry.title || 'Untitled reflection'}</h3>
                      <p>{entry.content.replace(/<[^>]+>/g, '').substring(0, 120)}{entry.content.length > 120 ? '...' : ''}</p>
                      <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <span className="dashboard-empty-icon"><BookOpen aria-hidden="true" /></span>
                <p>Your first reflection can start with just a few words.</p>
                <Link href="/journal" className="dashboard-text-link">Write an entry <ArrowRight aria-hidden="true" /></Link>
              </div>
            )}
          </article>

          <article className="dashboard-card dashboard-affirmation-card">
            <span className="dashboard-eyebrow">A thought to carry with you</span>
            <span className="dashboard-affirmation-mark" aria-hidden="true">“</span>
            <h2>{affirmation || 'Small steps are still steps forward.'}</h2>
            <button type="button" className="dashboard-secondary-action" onClick={fetchNewAffirmation}>
              <RotateCcw aria-hidden="true" /> A new affirmation
            </button>
          </article>
        </section>

        <section className="dashboard-breathing-card" aria-labelledby="dashboard-breathing-title">
          <div className="dashboard-breathing-copy">
            <span className="dashboard-eyebrow">Make a little space</span>
            <h2 id="dashboard-breathing-title">Take a calming pause</h2>
            <p>Follow a gentle breathing rhythm and give yourself five quiet minutes.</p>
            <div className="dashboard-breathing-controls">
              {!isRelaxationActive ? (
                <button type="button" className="dashboard-primary-action" onClick={startRelaxation}>
                  <Play aria-hidden="true" /> Begin breathing
                </button>
              ) : (
                <button type="button" className="dashboard-primary-action" onClick={pauseRelaxation}>
                  <Pause aria-hidden="true" /> Pause
                </button>
              )}
              <button type="button" className="dashboard-secondary-action" onClick={resetRelaxation}>
                <RotateCcw aria-hidden="true" /> Reset
              </button>
            </div>
          </div>
          <div className={`dashboard-breathing-orb ${isRelaxationActive ? 'is-active' : ''}`} aria-live="polite">
            <span>{formatTime(relaxationTime)}</span>
            <small>{isRelaxationActive ? breathPhase : 'five minutes'}</small>
          </div>
        </section>
      </main>
    </div>
  );
}