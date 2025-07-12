'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Heart, BookOpen, Gamepad2, Library, Trophy,
  Target, Calendar, Flame, Droplets, Sun, Moon,
  TrendingUp, Award, Star, Zap, Settings, LogOut,
  Wind, CloudRain, Leaf
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface MindGarden {
  id: string;
  treeHealth: number;
  treeStage: string;
  streak: number;
  totalPoints: number;
  lastWatered: string;
  soilQuality: number;
  sunlightHours: number;
  achievements: Achievement[];
  weeklyGrowth: number[];
  activities: ActivityLog[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ActivityLog {
  type: 'journal' | 'mood' | 'game' | 'resource' | 'checkin';
  points: number;
  timestamp: string;
}

interface GrowthStats {
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  nextMilestone: { points: number; reward: string };
}

export default function MindGardenPage() {
  // --- Replace hardcoded initial state with null ---
  const [garden, setGarden] = useState<MindGarden | null>(null);
  const [stats, setStats] = useState<GrowthStats | null>(null);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [environmentState, setEnvironmentState] = useState({
    timeOfDay: 'day',
    weather: 'clear',
    season: 'spring',
    windIntensity: 0.3
  });

  // Simulate environmental changes
  useEffect(() => {
    const interval = setInterval(() => {
      setEnvironmentState(prev => ({
        ...prev,
        timeOfDay: prev.timeOfDay === 'day' ? 'night' : 'day',
        weather: Math.random() > 0.7 ? 'rain' : 'clear',
        windIntensity: 0.2 + Math.random() * 0.6
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // --- Fetch real stats from backend on mount ---
  useEffect(() => {
    async function fetchGardenStats() {
      setIsLoading(true);
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        // Fetch garden data
        const gardenRes = await fetch('/api/mind-garden', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsRes = await fetch('/api/mind-garden/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        let gardenData = null;
        let statsData = null;
        if (gardenRes.ok) {
          const gardenJson = await gardenRes.json();
          if (gardenJson.data) gardenData = gardenJson.data;
        }
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.data) statsData = statsJson.data;
        }
        if (!gardenData || !statsData) {
          setMessage('No Mind Garden data found. Please check your account or try again later.');
          setIsLoading(false);
          return;
        }
        setGarden(gardenData);
        setStats(statsData);
      } catch (err) {
        console.error('Fetch error:', err);
        setMessage('Failed to load your Mind Garden stats.');
      }
      setIsLoading(false);
    }
    fetchGardenStats();
  }, []);

  // --- Water tree action: update backend and refresh ---
  const handleWaterTree = async () => {
    setIsLoading(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      const waterRes = await fetch('/api/mind-garden/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!waterRes.ok) {
        console.error('Water API error:', waterRes.status, waterRes.statusText);
        setMessage('Failed to water your tree.');
        setIsLoading(false);
        return;
      }
      setMessage('Your tree feels refreshed and vibrant!');
      // Refresh stats
      const res = await fetch('/api/mind-garden/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error('API error:', res.status, res.statusText);
        setMessage('Failed to refresh stats after watering.');
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      let gardenData = null;
      let statsData = null;
      if (data.garden && data.stats) {
        gardenData = data.garden;
        statsData = data.stats;
      } else if (data.success && data.data && data.data.garden && data.data.stats) {
        gardenData = data.data.garden;
        statsData = data.data.stats;
      } else {
        console.error('Unexpected API response after watering:', data);
        setMessage('Received invalid data from the server after watering.');
        setIsLoading(false);
        return;
      }
      setGarden(gardenData);
      setStats(statsData);
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Failed to water your tree.');
    }
    setIsLoading(false);
  };

  // --- Helper: determine tree stage based on points ---
  const getTreeStage = (points: number) => {
    if (points < 50) return 'seed';
    if (points < 200) return 'sprout';
    if (points < 1000) return 'sapling';
    if (points < 3000) return 'tree';
    return 'ancient';
  };

  // EnhancedStatCard: use bright gradients for day, muted for night
  const getCardGradient = (key: string) => {
    if (environmentState.timeOfDay === 'night') {
      switch (key) {
        case 'streak': return 'from-purple-900/60 via-indigo-900/60 to-blue-900/60';
        case 'points': return 'from-yellow-900/60 via-amber-900/60 to-orange-900/60';
        case 'soil': return 'from-blue-900/60 via-cyan-900/60 to-teal-900/60';
        case 'light': return 'from-green-900/60 via-emerald-900/60 to-teal-900/60';
        default: return 'from-slate-800/60 via-slate-900/60 to-indigo-900/60';
      }
    } else {
      switch (key) {
        case 'streak': return 'from-orange-400 via-yellow-300 to-pink-300';
        case 'points': return 'from-yellow-300 via-amber-200 to-orange-200';
        case 'soil': return 'from-blue-300 via-cyan-200 to-teal-200';
        case 'light': return 'from-green-300 via-emerald-200 to-teal-200';
        default: return 'from-white via-blue-100 to-indigo-100';
      }
    }
  };

  interface RealisticTreeVisualizationProps {
    health: number;
    stage: string;
    soilQuality: number;
    sunlight: number;
    environment: {
      timeOfDay: string;
      weather: string;
      season: string;
      windIntensity: number;
    };
  }

  const RealisticTreeVisualization = ({ health, stage, soilQuality, sunlight, environment }: RealisticTreeVisualizationProps) => {
    const getTreeElements = () => {
      const healthColor = health > 80 ? '#22c55e' : health > 60 ? '#84cc16' : health > 40 ? '#eab308' : '#ef4444';
      const trunkHeight = stage === 'seed' ? 0 : stage === 'sprout' ? 40 : stage === 'sapling' ? 80 : stage === 'tree' ? 120 : 160;
      const canopySize = stage === 'seed' ? 0 : stage === 'sprout' ? 20 : stage === 'sapling' ? 60 : stage === 'tree' ? 100 : 140;

      return {
        trunk: {
          height: trunkHeight,
          width: Math.max(8, trunkHeight * 0.15),
          color: '#8b4513'
        },
        canopy: {
          size: canopySize,
          color: healthColor,
          opacity: health / 100
        },
        roots: {
          spread: Math.max(20, trunkHeight * 0.8),
          depth: Math.max(10, trunkHeight * 0.3)
        }
      };
    };

    const tree = getTreeElements();
    const isNight = environment.timeOfDay === 'night';
    const isRaining = environment.weather === 'rain';

    return (
      <div className="relative w-full h-96 overflow-hidden">
        {/* Realistic Ground Terrain */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-10">
          <svg width="100%" height="100%" viewBox="0 0 800 128" className="absolute bottom-0">
            {/* Layered Ground */}
            <defs>
              <radialGradient id="soilGradient" cx="0.5" cy="0" r="1">
                <stop offset="0%" stopColor="#8b4513" />
                <stop offset="50%" stopColor="#a0522d" />
                <stop offset="100%" stopColor="#654321" />
              </radialGradient>
              <linearGradient id="grassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3a7c47" />
                <stop offset="100%" stopColor="#2d5a37" />
              </linearGradient>
            </defs>

            {/* Soil base */}
            <path d="M0 40 Q200 35 400 40 Q600 45 800 40 L800 128 L0 128 Z" fill="url(#soilGradient)" />

            {/* Grass surface */}
            <path d="M0 40 Q200 35 400 40 Q600 45 800 40 L800 55 Q600 50 400 55 Q200 50 0 55 Z" fill="url(#grassGradient)" />

            {/* Grass blades */}
            {grassBlades.map((blade, i) => (
              <path
                key={i}
                d={blade.d}
                stroke="#4a7c59"
                strokeWidth="1"
                fill="none"
                opacity={blade.opacity}
              // No transform here, only animate with CSS if needed
              />
            ))}
          </svg>
        </div>

        {/* Tree Visualization */}
        <div className="absolute left-1/2" style={{ bottom: '8rem', transform: 'translateX(-50%)' }}>
          <svg width="300" height="200" viewBox="0 0 300 200">
            <defs>
              <radialGradient id="trunkGradient" cx="0.3" cy="0.3" r="0.7">
                <stop offset="0%" stopColor="#a0522d" />
                <stop offset="70%" stopColor="#8b4513" />
                <stop offset="100%" stopColor="#654321" />
              </radialGradient>
              <radialGradient id="canopyGradient" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor={tree.canopy.color} stopOpacity={tree.canopy.opacity} />
                <stop offset="70%" stopColor={tree.canopy.color} stopOpacity={tree.canopy.opacity * 0.8} />
                <stop offset="100%" stopColor="#1a4a2e" stopOpacity={tree.canopy.opacity * 0.6} />
              </radialGradient>
              <filter id="leafShadow">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Underground Roots */}
            {stage !== 'seed' && (
              <g opacity="0.4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <path
                    key={i}
                    d={`M150 ${200 - tree.trunk.height} Q${150 + (i - 3) * 15} ${200 - tree.trunk.height + 20} ${150 + (i - 3) * tree.roots.spread / 6} ${200 - tree.trunk.height + tree.roots.depth}`}
                    stroke="#8b4513"
                    strokeWidth={Math.max(2, 8 - i)}
                    fill="none"
                    opacity={0.6}
                  />
                ))}
              </g>
            )}

            {/* Tree Trunk */}
            {tree.trunk.height > 0 && (
              <rect
                x={150 - tree.trunk.width / 2}
                y={200 - tree.trunk.height}
                width={tree.trunk.width}
                height={tree.trunk.height}
                fill="url(#trunkGradient)"
                rx={tree.trunk.width / 4}
                style={{
                  transform: `rotate(${Math.sin(Date.now() / 2000) * environment.windIntensity * 0.5}deg)`,
                  transformOrigin: '50% 100%',
                  transition: 'transform 0.5s ease'
                }}
              />
            )}

            {/* Tree Canopy */}
            {tree.canopy.size > 0 && (
              <g>
                {/* Main canopy */}
                <circle
                  cx="150"
                  cy={200 - tree.trunk.height - tree.canopy.size / 2}
                  r={tree.canopy.size / 2}
                  fill="url(#canopyGradient)"
                  filter="url(#leafShadow)"
                  style={{
                    transform: `translate(${Math.sin(Date.now() / 1500) * environment.windIntensity * 3}px, ${Math.cos(Date.now() / 1800) * environment.windIntensity * 2}px)`,
                    transition: 'transform 0.3s ease'
                  }}
                />

                {/* Additional foliage clusters */}
                {stage === 'tree' || stage === 'ancient' ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={150 + (i - 2) * 20}
                      cy={200 - tree.trunk.height - tree.canopy.size / 2 + (i % 2) * 15}
                      r={tree.canopy.size / 4}
                      fill="url(#canopyGradient)"
                      opacity={0.8}
                      style={{
                        transform: `translate(${Math.sin(Date.now() / 1200 + i) * environment.windIntensity * 2}px, ${Math.cos(Date.now() / 1600 + i) * environment.windIntensity * 1.5}px)`,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  ))
                ) : null}

                {/* Falling leaves */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i}>
                    <path
                      d="M0 0 Q3 -2 6 0 Q3 2 0 0"
                      fill={tree.canopy.color}
                      opacity={0.7}
                      style={{
                        transform: `translate(${150 + Math.sin(Date.now() / 1000 + i) * 60}px, ${200 - tree.trunk.height + Math.sin(Date.now() / 800 + i * 2) * 40}px) rotate(${Date.now() / 100 + i * 45}deg)`,
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Seed stage visualization */}
            {stage === 'seed' && (
              <g>
                {/* Place seed deeper inside the ground: y=130 visually buried in soil */}
                <ellipse cx="150" cy="130" rx="6" ry="8" fill="#8b4513" opacity="0.95" />
                {/* Soil shading above seed for buried effect */}
                <ellipse cx="150" cy="124" rx="12" ry="7" fill="#a0522d" opacity="0.7" />
                {/* Grass blades above ground */}
                <path d="M145 120 Q147 118 150 120 Q153 118 155 120" stroke="#4a7c59" strokeWidth="2" fill="none" opacity="0.7" />
              </g>
            )}
          </svg>
        </div>

        {/* Environmental Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Rain */}
          {isRaining && (
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 bg-blue-400 opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    height: `${10 + Math.random() * 20}px`,
                    animation: `raindrop ${0.5 + Math.random() * 0.5}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Fireflies at night */}
          {isNight && (
            <div className="absolute inset-0">
              {fireflies.map((f, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
                  style={{
                    left: `${f.left}%`,
                    top: `${f.top}%`,
                    animation: `firefly ${f.duration}s ease-in-out infinite`,
                    animationDelay: `${f.delay}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Particles for interaction feedback */}
          <div className="absolute inset-0" id="particles-container" />
        </div>

        {/* Health indicator */}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart
                className={`w-6 h-6 ${health > 70 ? 'text-green-400' : health > 40 ? 'text-yellow-400' : 'text-red-400'}`}
                style={{
                  filter: health > 70 ? 'drop-shadow(0 0 6px #22c55e)' : 'none'
                }}
              />
              <div className="absolute inset-0 animate-pulse">
                <Heart className="w-6 h-6 text-white opacity-20" />
              </div>
            </div>
            <div className="text-white font-bold text-lg">{health}%</div>
          </div>
        </div>
      </div>
    );
  };

  interface EnhancedStatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string | number;
    label: string;
    color: string;
    gradient: string;
    animate?: boolean;
  }

  const EnhancedStatCard = ({ icon: Icon, value, label, color, gradient, animate = false }: EnhancedStatCardProps) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl group cursor-pointer`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon
            className={`w-8 h-8 ${color} ${animate ? 'animate-bounce' : ''} transition-transform duration-300 group-hover:scale-110`}
          />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        </div>
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <div className="text-white/80 text-sm font-medium">{label}</div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
      </div>
    </div>
  );

  interface ActionCardProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    points: number;
    color: string;
    description: string;
  }

  const ActionCard = ({ href, icon: Icon, title, points, color, description }: ActionCardProps) => (
    <Link href={href} className="block group">
      <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} backdrop-blur-sm border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 text-center">
          <div className="mb-4">
            <Icon className="w-10 h-10 text-white mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>
          <div className="text-white font-bold text-lg mb-2">{title}</div>
          <div className="text-white/80 text-sm mb-2">{description}</div>
          <div className="text-white/60 text-xs font-medium">+{points} vitality</div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-400/30 border-t-green-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-green-400/10 animate-pulse"></div>
          </div>
          <p className="text-white/80 text-lg">Loading your digital sanctuary...</p>
        </div>
      </div>
    );
  }
  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold">{message}</p>
        </div>
      </div>
    );
  }
  if (!garden || !stats) {
    return null;
  }

  // --- Use real tree stage ---
  const treeStage = getTreeStage(garden.totalPoints);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${environmentState.timeOfDay === 'night'
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Main Tree Display */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black/5 via-black/10 to-black/20 backdrop-blur-xl border border-white/10 shadow-3xl">
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Your Digital Sanctuary</h1>
              <p className="text-white/70 text-lg">
                Stage: <span className="capitalize text-green-400 font-semibold text-xl">{treeStage}</span>
              </p>
            </div>
            <RealisticTreeVisualization
              health={garden.treeHealth}
              stage={treeStage}
              soilQuality={garden.soilQuality}
              sunlight={garden.sunlightHours}
              environment={environmentState}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <EnhancedStatCard
                icon={Flame}
                value={garden.streak}
                label="Day Streak"
                color="text-orange-400"
                gradient={getCardGradient('streak')}
                animate={true}
              />
              <EnhancedStatCard
                icon={Star}
                value={garden.totalPoints.toLocaleString()}
                label="Total Points"
                color="text-yellow-400"
                gradient={getCardGradient('points')}
              />
              <EnhancedStatCard
                icon={Droplets}
                value={`${garden.soilQuality}%`}
                label="Soil Vitality"
                color="text-blue-400"
                gradient={getCardGradient('soil')}
              />
              <EnhancedStatCard
                icon={Sun}
                value={`${garden.sunlightHours}h`}
                label="Daily Energy"
                color="text-green-400"
                gradient={getCardGradient('light')}
              />
            </div>

            <button
              onClick={handleWaterTree}
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold py-5 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <Droplets className="w-6 h-6" />
                <span className="text-lg">Nurture Your Sanctuary</span>
                {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              </div>
            </button>

            {message && (
              <div className="mt-6 p-4 rounded-2xl text-center font-medium bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Growth Analytics
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-white/80">
                <span className="text-lg">Sanctuary Vitality</span>
                <span className="text-xl font-bold text-white">{garden.treeHealth}/100</span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${garden.treeHealth}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-1">Today</div>
                  <div className="text-2xl font-bold text-green-400">+{stats.todayPoints}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-1">This Week</div>
                  <div className="text-2xl font-bold text-blue-400">+{stats.weekPoints}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-1">This Month</div>
                  <div className="text-2xl font-bold text-purple-400">+{stats.monthPoints}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              Next Milestone
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{stats.nextMilestone.reward}</div>
                  <div className="text-white/60">{(stats.nextMilestone.points - garden.totalPoints).toLocaleString()} points remaining</div>
                </div>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${(garden.totalPoints / stats.nextMilestone.points) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ActionCard
            href="/journal"
            icon={BookOpen}
            title="Reflect & Record"
            points={25}
            color="from-slate-700/30 via-slate-600/30 to-slate-800/30"
            description="Document your thoughts"
          />
          <ActionCard
            href="/mood"
            icon={Heart}
            title="Emotional Check-in"
            points={20}
            color="from-red-700/30 via-rose-600/30 to-pink-700/30"
            description="Track your wellbeing"
          />
          <ActionCard
            href="/games"
            icon={Gamepad2}
            title="Mental Training"
            points={30}
            color="from-violet-700/30 via-purple-600/30 to-indigo-700/30"
            description="Cognitive exercises"
          />
          <ActionCard
            href="/resources"
            icon={Library}
            title="Knowledge Base"
            points={15}
            color="from-teal-700/30 via-cyan-600/30 to-blue-700/30"
            description="Expand your understanding"
          />
        </div>

        {/* Environmental Conditions Panel */}
        <div className="bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Wind className="w-6 h-6 text-cyan-400" />
            Environmental Conditions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${environmentState.timeOfDay === 'day'
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                }`}>
                {environmentState.timeOfDay === 'day' ? (
                  <Sun className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Moon className="w-8 h-8 text-indigo-300" />
                )}
              </div>
              <div className="text-white font-semibold capitalize">{environmentState.timeOfDay}</div>
              <div className="text-white/60 text-sm">Cycle</div>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${environmentState.weather === 'rain'
                ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                : 'bg-gradient-to-br from-sky-500/20 to-blue-500/20'
                }`}>
                {environmentState.weather === 'rain' ? (
                  <CloudRain className="w-8 h-8 text-blue-400" />
                ) : (
                  <Sun className="w-8 h-8 text-sky-400" />
                )}
              </div>
              <div className="text-white font-semibold capitalize">{environmentState.weather}</div>
              <div className="text-white/60 text-sm">Weather</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Wind className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-white font-semibold">{Math.round(environmentState.windIntensity * 10)}/10</div>
              <div className="text-white/60 text-sm">Wind Level</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-white font-semibold capitalize">{environmentState.season}</div>
              <div className="text-white/60 text-sm">Season</div>
            </div>
          </div>
        </div>

        {/* Advanced Growth Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-gold-400" />
              Growth Timeline
            </h3>
            <div className="space-y-6">
              {[
                { stage: 'Seed', completed: true, points: 0, description: 'Beginning of your journey' },
                { stage: 'Sprout', completed: true, points: 100, description: 'First signs of growth' },
                { stage: 'Sapling', completed: true, points: 500, description: 'Steady development phase' },
                { stage: 'Tree', completed: garden.totalPoints >= 2000, points: 2000, description: 'Mature and resilient' },
                { stage: 'Ancient Tree', completed: garden.totalPoints >= 5000, points: 5000, description: 'Wisdom and mastery' }
              ].map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className={`w-4 h-4 rounded-full ${milestone.completed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
                    : garden.treeStage === milestone.stage.toLowerCase() || garden.treeStage === milestone.stage.toLowerCase().replace(' ', '')
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30 animate-pulse'
                      : 'bg-white/20'
                    }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-bold text-lg ${milestone.completed ? 'text-green-400' :
                          garden.treeStage === milestone.stage.toLowerCase() || garden.treeStage === milestone.stage.toLowerCase().replace(' ', '') ? 'text-yellow-400' : 'text-white/60'
                          }`}>
                          {milestone.stage}
                        </div>
                        <div className="text-white/60 text-sm">{milestone.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{milestone.points.toLocaleString()}</div>
                        <div className="text-white/60 text-sm">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Daily Vitality
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stats.todayPoints}</div>
                <div className="text-white/60">Points Today</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Journal Entry</span>
                  <span className="text-green-400 font-semibold">+25</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Mood Check</span>
                  <span className="text-blue-400 font-semibold">+20</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Game Session</span>
                  <span className="text-purple-400 font-semibold">+30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Resource Read</span>
                  <span className="text-cyan-400 font-semibold">+15</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Potential Total</span>
                  <span className="text-yellow-400">+90</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-3xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Recent Growth Activity
          </h3>
          <div className="space-y-4">
            {[
              { type: 'journal', action: 'Completed daily reflection', time: '2 hours ago', points: 25, icon: BookOpen, color: 'text-slate-400' },
              { type: 'mood', action: 'Logged emotional state', time: '4 hours ago', points: 20, icon: Heart, color: 'text-red-400' },
              { type: 'game', action: 'Finished cognitive training', time: '6 hours ago', points: 30, icon: Gamepad2, color: 'text-purple-400' },
              { type: 'resource', action: 'Read mental health article', time: '1 day ago', points: 15, icon: Library, color: 'text-cyan-400' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <activity.icon className={`w-6 h-6 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{activity.action}</div>
                  <div className="text-white/60 text-sm">{activity.time}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+{activity.points}</div>
                  <div className="text-white/60 text-sm">vitality</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes raindrop {
          0% { transform: translateY(-100vh) rotate(10deg); }
          100% { transform: translateY(100vh) rotate(10deg); }
        }
        
        @keyframes firefly {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(20px, -10px) scale(1.1); opacity: 0.8; }
          50% { transform: translate(-15px, -20px) scale(0.9); opacity: 1; }
          75% { transform: translate(25px, -5px) scale(1.2); opacity: 0.6; }
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}

// Add these before RealisticTreeVisualization
const grassBlades: { d: string; opacity: number }[] = Array.from({ length: 40 }).map((_, i) => ({
  d: `M${20 * i} 55 Q${20 * i + 5} ${45 + Math.random() * 10} ${20 * i + 10} 55`,
  opacity: 0.5 + Math.random() * 0.5
}));
const fireflies: { left: number; top: number; duration: number; delay: number }[] = Array.from({ length: 12 }).map(() => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 2 + Math.random() * 2,
  delay: Math.random() * 2
}));