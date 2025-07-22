'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart3, Gamepad2, Library, BookOpen, User, LogOut, Shield, Sparkles, TrendingUp, Calendar, Award, Settings, Camera, Edit3, Check, X, Upload, Image as ImageIcon, Trophy, Target, Flame, Star, Heart, Brain, Zap, Sun, Moon, Crown, Medal, ClipboardCheck, ClipboardList } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profilePicture?: string;
  checkInStreak?: number;
  totalCheckIns?: number;
  journalEntries?: number;
  gratitudeCount?: number;
  meditationSessions?: number;
  moodImprovement?: number;
  coursesCompleted?: number;
  crisisNavigated?: number;
}

interface GardenState {
  plants: number;
  flowers: number;
  health: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'daily' | 'self-care' | 'progress' | 'learning';
  requirement: number;
  currentProgress: number;
  completed: boolean;
  completedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Daily Activity type
interface DailyActivity {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  requirement: number;
  completed: boolean;
  link?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [activityDate, setActivityDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  useEffect(() => {
    fetchProfileData();
    fetchGardenState();
    fetchAchievements();
    generateDailyActivities();
  }, []);
  // Generate daily activities (reset every day)
  const generateDailyActivities = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (activityDate === today && dailyActivities.length > 0) return;
    setActivityDate(today);
    // Example activities, can be randomized or fetched from backend
    const activities: DailyActivity[] = [
      {
        id: 'log-mood',
        name: 'Log Your Mood',
        description: 'Record your mood for today.',
        icon: <TrendingUp className="w-6 h-6" />,
        progress: user?.totalCheckIns ? 1 : 0,
        requirement: 1,
        completed: false,
        link: '/mood',
      },
      {
        id: 'journal-entry',
        name: 'Write a Journal Entry',
        description: 'Reflect and write in your journal.',
        icon: <BookOpen className="w-6 h-6" />,
        progress: user?.journalEntries ? 1 : 0,
        requirement: 1,
        completed: false,
        link: '/journal',
      },
      {
        id: 'play-game',
        name: 'Play 3 Games',
        description: 'Play any 3 games today.',
        icon: <Gamepad2 className="w-6 h-6" />,
        progress: user?.totalCheckIns ? Math.min(user.totalCheckIns % 3, 3) : 0,
        requirement: 3,
        completed: false,
        link: '/games',
      },
      {
        id: 'read-resource',
        name: 'Read an Article',
        description: 'Read a resource or story.',
        icon: <Library className="w-6 h-6" />,
        progress: user?.coursesCompleted ? 1 : 0,
        requirement: 1,
        completed: false,
        link: '/resources',
      },
    ];
    // Simulate completion based on user data
    const updated = activities.map(act => ({
      ...act,
      completed: act.progress >= act.requirement
    }));
    setDailyActivities(updated);
  };

  // Fetch achievements from backend and set state
  // Fetch achievements from backend and merge with templates for progress
  const fetchAchievements = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user achievement progress from backend
      const response = await fetch('/api/user/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let userAchievements = [];
      if (response.ok) {
        const data = await response.json();
        userAchievements = data.achievements || [];
      }

      // Achievement templates (should match backend and all shown in profile page)
      const achievementTemplates = [
        { id: 'first-checkin', name: 'First Steps', description: 'Complete your first check-in', icon: <Star className="w-6 h-6" />, category: 'daily', requirement: 1, rarity: 'common' },
        { id: '3-day-streak', name: 'Getting Started', description: 'Check in for 3 days straight', icon: <Calendar className="w-6 h-6" />, category: 'daily', requirement: 3, rarity: 'common' },
        { id: '7-day-streak', name: '7-Day Warrior', description: 'Check in for 7 days straight', icon: <Flame className="w-6 h-6" />, category: 'daily', requirement: 7, rarity: 'rare' },
        { id: '14-day-streak', name: 'Fortnight Fighter', description: 'Maintain a 14-day check-in streak', icon: <Zap className="w-6 h-6" />, category: 'daily', requirement: 14, rarity: 'rare' },
        { id: '30-day-streak', name: 'Consistency Master', description: 'Maintain a 30-day check-in streak', icon: <Crown className="w-6 h-6" />, category: 'daily', requirement: 30, rarity: 'legendary' },
        { id: 'journal-journey', name: 'Journal Journey', description: 'Write 10 journal entries', icon: <BookOpen className="w-6 h-6" />, category: 'self-care', requirement: 10, rarity: 'rare' },
        { id: 'meditation-novice', name: 'Meditation Novice', description: 'Complete 5 meditation sessions', icon: <Sparkles className="w-6 h-6" />, category: 'self-care', requirement: 5, rarity: 'common' },
        // Add all other templates you want to support, matching those in the profile page
        { id: 'gratitude-guardian', name: 'Gratitude Guardian', description: 'Record 30 gratitudes', icon: <Heart className="w-6 h-6" />, category: 'self-care', requirement: 30, rarity: 'epic' },
        { id: 'mood-tracker', name: 'Mood Master', description: 'Track mood for 20 days', icon: <TrendingUp className="w-6 h-6" />, category: 'progress', requirement: 20, rarity: 'rare' },
        { id: 'achievement-hunter', name: 'Achievement Hunter', description: 'Unlock 10 achievements', icon: <Trophy className="w-6 h-6" />, category: 'progress', requirement: 10, rarity: 'epic' },
        { id: 'legend-status', name: 'Legend Status', description: 'Unlock 25 achievements', icon: <Medal className="w-6 h-6" />, category: 'progress', requirement: 25, rarity: 'legendary' },
        // ...add more as needed...
      ];

      // Merge backend progress with templates, using real stats for progress
      const mergedAchievements: Achievement[] = achievementTemplates.map(template => {
        let currentProgress = 0;
        switch (template.id) {
          case 'first-checkin':
            currentProgress = user?.totalCheckIns || 0;
            break;
          case '3-day-streak':
            currentProgress = user?.checkInStreak || 0;
            break;
          case '7-day-streak':
            currentProgress = user?.checkInStreak || 0;
            break;
          case '14-day-streak':
            currentProgress = user?.checkInStreak || 0;
            break;
          case '30-day-streak':
            currentProgress = user?.checkInStreak || 0;
            break;
          case 'journal-journey':
            currentProgress = user?.journalEntries || 0;
            break;
          case 'meditation-novice':
            currentProgress = user?.meditationSessions || 0;
            break;
          case 'gratitude-guardian':
            currentProgress = user?.gratitudeCount || 0;
            break;
          case 'mood-tracker':
            currentProgress = user?.totalCheckIns || 0;
            break;
          case 'achievement-hunter':
            currentProgress = achievements.filter(a => a.completed).length;
            break;
          case 'legend-status':
            currentProgress = achievements.filter(a => a.completed).length;
            break;
          default:
            currentProgress = 0;
        }
        const completed = currentProgress >= template.requirement;
        return {
          ...template,
          currentProgress: Math.min(currentProgress, template.requirement),
          completed,
          completedAt: completed ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          category: template.category as 'daily' | 'self-care' | 'progress' | 'learning',
          rarity: template.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        };
      });
      setAchievements(mergedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

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
        setProfileImage(data.data.profilePicture || null);
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

  const generateAchievements = () => {
    // This would typically come from your backend
    const achievementTemplates = [
      // Daily Habits - Basic
      { id: 'first-checkin', name: 'First Steps', description: 'Complete your first check-in', icon: <Star className="w-6 h-6" />, category: 'daily', requirement: 1, rarity: 'common' },
      { id: '3-day-streak', name: 'Getting Started', description: 'Check in for 3 days straight', icon: <Calendar className="w-6 h-6" />, category: 'daily', requirement: 3, rarity: 'common' },
      { id: '7-day-streak', name: '7-Day Warrior', description: 'Check in for 7 days straight', icon: <Flame className="w-6 h-6" />, category: 'daily', requirement: 7, rarity: 'rare' },
      { id: '14-day-streak', name: 'Fortnight Fighter', description: 'Maintain a 14-day check-in streak', icon: <Zap className="w-6 h-6" />, category: 'daily', requirement: 14, rarity: 'rare' },
      { id: '30-day-streak', name: 'Consistency Master', description: 'Maintain a 30-day check-in streak', icon: <Crown className="w-6 h-6" />, category: 'daily', requirement: 30, rarity: 'legendary' },
      { id: '100-day-streak', name: 'Century Champion', description: 'The ultimate 100-day streak', icon: <Medal className="w-6 h-6" />, category: 'daily', requirement: 100, rarity: 'legendary' },
      { id: 'morning-ritual', name: 'Morning Ritual Master', description: 'Complete 10 morning check-ins', icon: <Sun className="w-6 h-6" />, category: 'daily', requirement: 10, rarity: 'rare' },
      { id: 'evening-wind-down', name: 'Evening Wind-Down', description: 'Complete 10 evening check-ins', icon: <Moon className="w-6 h-6" />, category: 'daily', requirement: 10, rarity: 'rare' },
      { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Check in on 10 weekends', icon: <Calendar className="w-6 h-6" />, category: 'daily', requirement: 10, rarity: 'common' },

      // Self-Care - Mental Health
      { id: 'mindful-moment', name: 'Mindful Moment', description: 'Complete your first meditation', icon: <Brain className="w-6 h-6" />, category: 'self-care', requirement: 1, rarity: 'common' },
      { id: 'meditation-novice', name: 'Meditation Novice', description: 'Complete 5 meditation sessions', icon: <Sparkles className="w-6 h-6" />, category: 'self-care', requirement: 5, rarity: 'common' },
      { id: 'zen-master', name: 'Zen Master', description: 'Complete 15 meditation sessions', icon: <Crown className="w-6 h-6" />, category: 'self-care', requirement: 15, rarity: 'epic' },
      { id: 'meditation-guru', name: 'Meditation Guru', description: 'Complete 50 meditation sessions', icon: <Star className="w-6 h-6" />, category: 'self-care', requirement: 50, rarity: 'legendary' },
      { id: 'breathing-expert', name: 'Breathing Expert', description: 'Master 20 breathing exercises', icon: <Zap className="w-6 h-6" />, category: 'self-care', requirement: 20, rarity: 'rare' },

      // Self-Care - Journaling & Expression
      { id: 'journal-journey', name: 'Journal Journey', description: 'Write 10 journal entries', icon: <BookOpen className="w-6 h-6" />, category: 'self-care', requirement: 10, rarity: 'rare' },
      { id: 'story-teller', name: 'Story Teller', description: 'Write 25 journal entries', icon: <Edit3 className="w-6 h-6" />, category: 'self-care', requirement: 25, rarity: 'epic' },
      { id: 'life-chronicler', name: 'Life Chronicler', description: 'Write 100 journal entries', icon: <BookOpen className="w-6 h-6" />, category: 'self-care', requirement: 100, rarity: 'legendary' },
      { id: 'gratitude-guardian', name: 'Gratitude Guardian', description: 'Record 30 gratitudes', icon: <Heart className="w-6 h-6" />, category: 'self-care', requirement: 30, rarity: 'epic' },
      { id: 'thankfulness-sage', name: 'Thankfulness Sage', description: 'Record 100 gratitudes', icon: <Star className="w-6 h-6" />, category: 'self-care', requirement: 100, rarity: 'legendary' },
      { id: 'emotion-explorer', name: 'Emotion Explorer', description: 'Express 50 different emotions', icon: <Heart className="w-6 h-6" />, category: 'self-care', requirement: 50, rarity: 'epic' },

      // Progress & Growth - Mood & Wellness
      { id: 'mood-tracker', name: 'Mood Master', description: 'Track mood for 20 days', icon: <TrendingUp className="w-6 h-6" />, category: 'progress', requirement: 20, rarity: 'rare' },
      { id: 'wellness-warrior', name: 'Wellness Warrior', description: 'Improve wellness score by 25%', icon: <Trophy className="w-6 h-6" />, category: 'progress', requirement: 25, rarity: 'epic' },
      { id: 'transformation-titan', name: 'Transformation Titan', description: 'Improve wellness score by 50%', icon: <Crown className="w-6 h-6" />, category: 'progress', requirement: 50, rarity: 'legendary' },
      { id: 'goal-getter', name: 'Goal Getter', description: 'Complete 5 personal goals', icon: <Target className="w-6 h-6" />, category: 'progress', requirement: 5, rarity: 'rare' },
      { id: 'achievement-hunter', name: 'Achievement Hunter', description: 'Unlock 10 achievements', icon: <Trophy className="w-6 h-6" />, category: 'progress', requirement: 10, rarity: 'epic' },
      { id: 'legend-status', name: 'Legend Status', description: 'Unlock 25 achievements', icon: <Medal className="w-6 h-6" />, category: 'progress', requirement: 25, rarity: 'legendary' },

      // Special & Seasonal Achievements
      { id: 'new-year-resolution', name: 'New Year\'s Resolution', description: 'Start your journey in January', icon: <Sparkles className="w-6 h-6" />, category: 'progress', requirement: 1, rarity: 'rare' },
      { id: 'summer-vibes', name: 'Summer Vibes', description: 'Stay consistent during summer months', icon: <Sun className="w-6 h-6" />, category: 'daily', requirement: 30, rarity: 'rare' },
      { id: 'winter-wellness', name: 'Winter Wellness', description: 'Maintain wellness during winter', icon: <Moon className="w-6 h-6" />, category: 'self-care', requirement: 30, rarity: 'rare' },
      { id: 'milestone-marker', name: 'Milestone Marker', description: 'Celebrate 6 months of growth', icon: <Trophy className="w-6 h-6" />, category: 'progress', requirement: 180, rarity: 'legendary' },
      { id: 'anniversary-achiever', name: 'Anniversary Achiever', description: 'One full year of dedication', icon: <Crown className="w-6 h-6" />, category: 'progress', requirement: 365, rarity: 'legendary' },

      // Fun & Engagement
      { id: 'early-bird', name: 'Early Bird', description: 'Check in before 7 AM for 7 days', icon: <Sun className="w-6 h-6" />, category: 'daily', requirement: 7, rarity: 'rare' },
      { id: 'night-owl', name: 'Night Owl', description: 'Check in after 10 PM for 7 days', icon: <Moon className="w-6 h-6" />, category: 'daily', requirement: 7, rarity: 'rare' },
      { id: 'perfectionist', name: 'Perfectionist', description: 'Complete all daily activities for 7 days', icon: <Star className="w-6 h-6" />, category: 'daily', requirement: 7, rarity: 'epic' },
      { id: 'explorer', name: 'Explorer', description: 'Try every feature at least once', icon: <Sparkles className="w-6 h-6" />, category: 'learning', requirement: 10, rarity: 'rare' },
      { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share your progress with friends', icon: <Heart className="w-6 h-6" />, category: 'progress', requirement: 5, rarity: 'common' }
    ];
    if (user) {
      const userAchievements = achievementTemplates.map(template => {
        let currentProgress = 0;

        // Calculate progress based on user data
        switch (template.id) {
          case 'first-checkin':
            currentProgress = user.totalCheckIns || 0;
            break;
          case '7-day-streak':
          case '30-day-streak':
            currentProgress = user.checkInStreak || 0;
            break;
          case 'morning-ritual':
            currentProgress = Math.floor((user.totalCheckIns || 0) * 0.3);
            break;
          case 'mindful-moment':
          case 'zen-master':
            currentProgress = user.meditationSessions || 0;
            break;
          case 'journal-journey':
            currentProgress = user.journalEntries || 0;
            break;
          case 'gratitude-guardian':
            currentProgress = user.gratitudeCount || 0;
            break;
          case 'mood-tracker':
            currentProgress = user.totalCheckIns || 0;
            break;
          case 'wellness-warrior':
            currentProgress = user.moodImprovement || 0;
            break;
          case 'goal-getter':
            currentProgress = Math.floor((garden?.flowers || 0));
            break;
          case 'skill-seeker':
            currentProgress = Math.floor((user.coursesCompleted || 0) * 0.6);
            break;
          case 'course-champion':
            currentProgress = user.coursesCompleted || 0;
            break;
          case 'resilience-builder':
            currentProgress = user.crisisNavigated || 0;
            break;
          case '3-day-streak':
          case '14-day-streak':
          case '100-day-streak':
            currentProgress = user.checkInStreak || 0;
            break;
          case 'evening-wind-down':
          case 'weekend-warrior':
            currentProgress = Math.floor((user.totalCheckIns || 0) * 0.4);
            break;
          case 'meditation-novice':
          case 'meditation-guru':
          case 'breathing-expert':
            currentProgress = user.meditationSessions || 0;
            break;
          case 'story-teller':
          case 'life-chronicler':
            currentProgress = user.journalEntries || 0;
            break;
          case 'thankfulness-sage':
          case 'emotion-explorer':
            currentProgress = user.gratitudeCount || 0;
            break;
          case 'transformation-titan':
            currentProgress = user.moodImprovement || 0;
            break;
          case 'achievement-hunter':
          case 'legend-status':
            currentProgress = achievements.filter(a => a.completed).length;
            break;
          case 'habit-builder':
          case 'lifestyle-architect':
          case 'balance-master':
          case 'energy-optimizer':
            currentProgress = Math.floor((user.checkInStreak || 0) * 0.8);
            break;
          case 'coping-champion':
          case 'stress-slayer':
          case 'anxiety-warrior':
            currentProgress = Math.floor((user.coursesCompleted || 0) * 1.5);
            break;
          case 'knowledge-seeker':
          case 'wisdom-keeper':
            currentProgress = user.coursesCompleted || 0;
            break;
          case 'mentor-ready':
          case 'community-leader':
            currentProgress = Math.floor(Math.random() * 2); // Simulated for demo
            break;
          case 'new-year-resolution':
          case 'summer-vibes':
          case 'winter-wellness':
            currentProgress = user.checkInStreak || 0;
            break;
          case 'milestone-marker':
          case 'anniversary-achiever':
            currentProgress = user.totalCheckIns || 0;
            break;
          case 'early-bird':
          case 'night-owl':
          case 'perfectionist':
            currentProgress = Math.floor((user.checkInStreak || 0) * 0.6);
            break;
          case 'explorer':
            currentProgress = Math.min(10, (user.coursesCompleted || 0) + (user.meditationSessions || 0) + (user.journalEntries || 0));
            break;
          case 'social-butterfly':
            currentProgress = Math.floor(Math.random() * 6); // Simulated for demo
            break;
          default:
            currentProgress = 0;
        }

        const completed = currentProgress >= template.requirement;

        return {
          ...template,
          currentProgress: Math.min(currentProgress, template.requirement),
          completed,
          completedAt: completed ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
        };
      });

      setAchievements(userAchievements as Achievement[]);
    }
  };

  useEffect(() => {
    if (user) {
      generateAchievements();
      generateDailyActivities();
    }
  }, [user, garden]);

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.url);
        setUser(prev => prev ? { ...prev, profilePicture: data.url } : prev);
        // Immediately update profile image in UI
        fetchProfileData();
      } else {
        setError('Failed to upload image.');
      }
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setError('');
    setIsUploadingImage(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('/api/user/profile-image', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        setProfileImage(null);
        setUser(prev => prev ? { ...prev, profilePicture: undefined } : prev);
      } else {
        setError('Failed to remove image.');
      }
    } catch (error) {
      setError('Failed to remove image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/');
  };

  const getProfileImageSrc = () => {
    return profileImage || user?.profilePicture || null;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const completedAchievements = achievements.filter(a => a.completed).length;
  const totalAchievements = achievements.length;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <EmergencySupport />
      <Navbar />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full px-2 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sidebar - Now on the Left */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full -translate-x-24 -translate-y-24"></div>
              <div className="relative z-10 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 mx-auto">
                    {getProfileImageSrc() ? (
                      <img
                        src={getProfileImageSrc()!}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <button
                      onClick={handleCameraClick}
                      disabled={isUploadingImage}
                      className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                    {getProfileImageSrc() && (
                      <button
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{user?.name}</h1>
                <p className="text-blue-600 mb-4">{user?.email}</p>
                <div className="text-sm text-gray-500">
                  Member since {user ? new Date(user.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700">Current Streak</span>
                  </div>
                  <span className="font-bold text-orange-600">{user?.quickStats?.checkInStreak ?? 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700">Gratitude Count</span>
                  </div>
                  <span className="font-bold text-green-600">{user?.quickStats?.gratitudeCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700">Meditations</span>
                  </div>
                  <span className="font-bold text-purple-600">{user?.quickStats?.meditationSessions ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700">Achievements</span>
                  </div>
                  <span className="font-bold text-blue-600">{completedAchievements}/{totalAchievements}</span>
                </div>
              </div>
            </div>
            {/* Mind Garden Preview */}
            {garden && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mind Garden</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                      Plants Growing
                    </span>
                    <span className="font-bold text-green-600">{garden.plants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                      Flowers Bloomed
                    </span>
                    <span className="font-bold text-pink-600">{garden.flowers}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Garden Health</span>
                      <span className="font-medium text-green-600">{garden.health}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${garden.health}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    href="/games/mind-garden"
                    className="block w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Visit Garden
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* Main Content - Now on the Right */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Tab Navigation */}
            <div className="flex gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-2 shadow-lg">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${activeTab === 'account'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100'
                  }`}
              >
                <User className="w-5 h-5 inline mr-2" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${activeTab === 'activities'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100'
                  }`}
              >
                <ClipboardList className="w-5 h-5 inline mr-2" />
                Daily Activities
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100'
                  }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                Achievements
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${activeTab === 'progress'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100'
                  }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Progress
              </button>
            </div>
            {/* ...existing code for tabs and content, using real backend data for all stats and achievements... */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full -translate-x-48 -translate-y-48"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                        <ClipboardCheck className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          Daily Activities
                        </h2>
                        <p className="text-gray-600 text-lg">
                          {dailyActivities.filter(a => a.completed).length} of {dailyActivities.length} completed
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                        style={{ width: `${(dailyActivities.filter(a => a.completed).length / dailyActivities.length) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {dailyActivities.map(activity => (
                    <div
                      key={activity.id}
                      className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-300 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${activity.completed ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 rounded-2xl"></div>
                      {activity.completed && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white shadow-lg ${activity.completed ? 'animate-pulse' : ''}`}>{activity.icon}</div>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${activity.completed ? 'text-blue-700' : 'text-gray-700'}`}>{activity.name}</h3>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{activity.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className={`font-medium ${activity.completed ? 'text-teal-600' : 'text-blue-600'}`}>{activity.progress}/{activity.requirement}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className={`h-3 rounded-full transition-all duration-1000 ${activity.completed ? 'bg-gradient-to-r from-blue-400 to-teal-600' : 'bg-gradient-to-r from-blue-400 to-teal-400'}`} style={{ width: `${(activity.progress / activity.requirement) * 100}%` }}></div>
                          </div>
                        </div>
                        {activity.link && (
                          <Link
                            href={activity.link}
                            className="block w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Go to Activity
                          </Link>
                        )}
                        {activity.completed && (
                          <div className="mt-4 text-sm text-green-600 font-medium">
                            Completed for today!
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* ...existing code for other tabs... */}
            {activeTab === 'account' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-purple-100/50 rounded-full translate-x-32 -translate-y-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Account Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isEditing
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        }`}
                    >
                      {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-blue-700 mb-3">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:opacity-50 transition-all duration-300 shadow-inner"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-blue-700 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:opacity-50 transition-all duration-300 shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="p-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-200 text-red-700 rounded-xl shadow-lg">
                        <div className="flex items-center gap-2">
                          <X className="w-5 h-5" />
                          {error}
                        </div>
                      </div>
                    )}
                    {isEditing && (
                      <button
                        type="submit"
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Check className="w-5 h-5 inline mr-2" />
                        Save Changes
                      </button>
                    )}
                    <div className="pt-8 border-t border-blue-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <LogOut className="w-6 h-6 inline-block mr-3" />
                        Logout
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-full -translate-x-48 -translate-y-48"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          Achievements
                        </h2>
                        <p className="text-gray-600 text-lg">
                          {achievements?.filter(a => a.completed).length ?? 0} of {achievements?.length ?? 0} unlocked
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                        style={{ width: `${((achievements?.filter(a => a.completed).length ?? 0) / (achievements?.length ?? 1)) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 shadow-lg">
                  {['all', 'daily', 'self-care', 'progress', 'learning'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {(selectedCategory === 'all' ? achievements : achievements.filter(a => a.category === selectedCategory)).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 ${getRarityBorder(achievement.rarity)} shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${achievement.completed ? 'ring-2 ring-green-300' : ''}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(achievement.rarity)} opacity-10 rounded-2xl`}></div>
                      {achievement.completed && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-xl text-white shadow-lg ${achievement.completed ? 'animate-pulse' : ''}`}>{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${achievement.completed ? 'text-green-700' : 'text-gray-700'}`}>{achievement.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' : achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{achievement.rarity}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className={`font-medium ${achievement.completed ? 'text-green-600' : 'text-blue-600'}`}>{achievement.currentProgress}/{achievement.requirement}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className={`h-3 rounded-full transition-all duration-1000 ${achievement.completed ? 'bg-gradient-to-r from-green-400 to-green-600' : `bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}`} style={{ width: `${(achievement.currentProgress / achievement.requirement) * 100}%` }}></div>
                          </div>
                        </div>
                        {achievement.completed && achievement.completedAt && (
                          <div className="mt-4 text-sm text-green-600 font-medium">
                            ✨ Completed on {new Date(achievement.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Check-in Streak</h3>
                        <p className="text-3xl font-bold text-blue-600">{user?.quickStats?.checkInStreak ?? 0}</p>
                        <p className="text-sm text-gray-500">days</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Journal Entries</h3>
                        <p className="text-3xl font-bold text-green-600">{user?.quickStats?.journalEntries ?? 0}</p>
                        <p className="text-sm text-gray-500">written</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">Meditation Sessions</h3>
                        <p className="text-3xl font-bold text-purple-600">{user?.quickStats?.meditationSessions ?? 0}</p>
                        <p className="text-sm text-gray-500">completed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-100/50 to-teal-100/50 rounded-full translate-x-32 -translate-y-32"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-8">
                      Detailed Progress
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-semibold text-gray-700">Wellness Improvement</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overall Progress</span>
                            <span className="font-bold text-green-600">{user?.quickStats?.moodImprovement ?? 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-gradient-to-r from-green-400 to-teal-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${user?.quickStats?.moodImprovement ?? 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-purple-600" />
                          <h3 className="text-xl font-semibold text-gray-700">Learning Journey</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Courses Completed</span>
                            <span className="font-bold text-purple-600">{user?.quickStats?.coursesCompleted ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Check-ins</span>
                            <span className="font-bold text-blue-600">{user?.quickStats?.totalCheckIns ?? 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Gratitude Entries</span>
                            <span className="font-bold text-pink-600">{user?.quickStats?.gratitudeCount ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-semibold text-gray-700">Loading profile...</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
