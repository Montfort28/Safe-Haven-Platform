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
import EmergencySupport from '@/components/EmergencySupport';

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
        case 'streak': return 'from-yellow-100 via-yellow-50 to-pink-50';
        case 'points': return 'from-yellow-50 via-amber-100 to-orange-50';
        case 'soil': return 'from-blue-50 via-cyan-50 to-teal-50';
        case 'light': return 'from-green-50 via-emerald-50 to-teal-50';
        default: return 'from-white via-white to-white';
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

      // More realistic growth stages
      const stages = {
        seed: { trunk: 0, canopy: 0, roots: 0 },
        germination: { trunk: 0, canopy: 0, roots: 25 }, // Just roots underground
        sprout: { trunk: 15, canopy: 20, roots: 35 }, // Tiny stem and first leaves
        sapling: { trunk: 60, canopy: 50, roots: 60 }, // Small tree
        tree: { trunk: 120, canopy: 100, roots: 80 }, // Mature tree
        ancient: { trunk: 160, canopy: 140, roots: 100 } // Old tree
      };

      const currentStage = stages[stage];

      return {
        trunk: {
          height: currentStage.trunk,
          width: Math.max(4, currentStage.trunk * 0.15),
          color: '#8b4513'
        },
        canopy: {
          size: currentStage.canopy,
          color: healthColor,
          opacity: Math.max(0.7, health / 100)
        },
        roots: {
          spread: currentStage.roots,
          depth: Math.max(15, currentStage.roots * 0.4)
        }
      };
    };

    const tree = getTreeElements();
    const isNight = environment.timeOfDay === 'night';
    const isRaining = environment.weather === 'rain';

    return (
      <div className="relative w-full h-96 overflow-hidden rounded-2xl">
        {/* Sky Background */}
        <div className={`absolute inset-0 transition-all duration-1000 ${isNight
          ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-800'
          : 'bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100'
          }`} />

        {/* Ground Layer as a styled div */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-20" style={{
          background: 'linear-gradient(to bottom, #4a7c59 0%, #3a5a47 20%, #8b4513 50%, #a0522d 80%, #654321 100%)',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          boxShadow: '0 -4px 24px 0 rgba(60,40,20,0.15)'
        }}>
          {/* Grass surface */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '12px',
            background: '#4a7c59',
            opacity: 0.9,
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          }} />
          {/* Grass blades */}
          <svg width="100%" height="18" viewBox="0 0 800 18" style={{ position: 'absolute', top: 0, left: 0 }}>
            {Array.from({ length: 200 }).map((_, i) => {
              const x = (i * 4) + (Math.random() * 2);
              const height = 6 + Math.random() * 10;
              const curve = Math.random() * 3 - 1.5;
              const opacity = 0.6 + Math.random() * 0.4;
              return (
                <path
                  key={i}
                  d={`M${x} 16 Q${x + curve} ${16 - height} ${x + curve * 0.5} ${14 - height}`}
                  stroke="#4a7c59"
                  strokeWidth="1"
                  fill="none"
                  opacity={opacity}
                />
              );
            })}
          </svg>
        </div>

        {/* Tree Visualization */}
        <div className="absolute left-1/2 bottom-24 transform -translate-x-1/2 z-30">
          <svg width="400" height="360" viewBox="0 0 400 360">
            <defs>
              <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#654321" />
                <stop offset="30%" stopColor="#8b4513" />
                <stop offset="70%" stopColor="#a0522d" />
                <stop offset="100%" stopColor="#654321" />
              </linearGradient>
              <radialGradient id="canopyGradient" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor={tree.canopy.color} stopOpacity={tree.canopy.opacity} />
                <stop offset="80%" stopColor="#1a4a2e" stopOpacity={tree.canopy.opacity * 0.7} />
              </radialGradient>
            </defs>

            {/* Underground Roots */}
            {tree.roots.spread > 0 && (
              <g opacity="0.4">
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i * 60) + 210; // Start from bottom
                  const length = tree.roots.spread;
                  const x = 200 + Math.cos(angle * Math.PI / 180) * length;
                  const y = 250 + Math.sin(angle * Math.PI / 180) * (length * 0.4);
                  return (
                    <path
                      key={i}
                      d={`M200 250 Q${200 + (x - 200) * 0.6} ${250 + (y - 250) * 0.8} ${x} ${y}`}
                      stroke="#654321"
                      strokeWidth={Math.max(1, 4 - i * 0.3)}
                      fill="none"
                    />
                  );
                })}
              </g>
            )}

            {/* SEED STAGE - Properly positioned in ground */}
            {stage === 'seed' && (
              <g>
                {/* Seed visually embedded in the ground (half above, half below ground) */}
                <ellipse cx="200" cy="360" rx="6" ry="9" fill="#8b4513" />
                <ellipse cx="200" cy="358" rx="4" ry="6" fill="#cd853f" />
              </g>
            )}

            {/* GERMINATION STAGE - Roots growing */}
            {stage === 'germination' && (
              <g>
                {/* Seed with crack */}
                <ellipse cx="200" cy="250" rx="6" ry="9" fill="#8b4513" />
                <path d="M194 250 L206 250" stroke="#4a7c59" strokeWidth="1" />
                {/* Small root tip */}
                <path d="M200 259 Q198 265 195 270" stroke="#cd853f" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* SPROUT STAGE - First stem and leaves */}
            {stage === 'sprout' && (
              <g>
                {/* Tiny stem */}
                <rect
                  x="198"
                  y={250 - tree.trunk.height}
                  width="4"
                  height={tree.trunk.height}
                  fill="#4a7c59"
                  rx="2"
                />
                {/* First tiny leaves */}
                <ellipse cx="195" cy={250 - tree.trunk.height} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
                <ellipse cx="205" cy={250 - tree.trunk.height - 2} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
              </g>
            )}

            {/* SAPLING AND ABOVE - Traditional tree structure */}
            {(stage === 'sapling' || stage === 'tree' || stage === 'ancient') && (
              <g>
                {/* Tree Trunk */}
                <rect
                  x={200 - tree.trunk.width / 2}
                  y={250 - tree.trunk.height}
                  width={tree.trunk.width}
                  height={tree.trunk.height}
                  fill="url(#trunkGradient)"
                  rx={tree.trunk.width / 8}
                />

                {/* Bark texture */}
                {Array.from({ length: Math.floor(tree.trunk.height / 12) }).map((_, i) => (
                  <line
                    key={i}
                    x1={200 - tree.trunk.width / 2 + 1}
                    y1={250 - i * 12}
                    x2={200 + tree.trunk.width / 2 - 1}
                    y2={250 - i * 12}
                    stroke="#543821"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                ))}

                {/* Tree Canopy */}
                <circle
                  cx="200"
                  cy={250 - tree.trunk.height - tree.canopy.size / 2}
                  r={tree.canopy.size / 2}
                  fill="url(#canopyGradient)"
                />

                {/* Additional foliage for mature trees */}
                {stage === 'tree' || stage === 'ancient' ? (
                  Array.from({ length: 4 }).map((_, i) => {
                    const angle = i * 90;
                    const distance = tree.canopy.size / 4;
                    const x = 200 + Math.cos(angle * Math.PI / 180) * distance;
                    const y = (250 - tree.trunk.height - tree.canopy.size / 2) + Math.sin(angle * Math.PI / 180) * distance;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={tree.canopy.size / 6}
                        fill="url(#canopyGradient)"
                        opacity="0.8"
                      />
                    );
                  })
                ) : null}

                {/* Flowers for healthy mature trees */}
                {health > 80 && (stage === 'tree' || stage === 'ancient') && (
                  Array.from({ length: 6 }).map((_, i) => {
                    const angle = i * 60;
                    const distance = tree.canopy.size / 3;
                    const x = 200 + Math.cos(angle * Math.PI / 180) * distance;
                    const y = (250 - tree.trunk.height - tree.canopy.size / 2) + Math.sin(angle * Math.PI / 180) * distance;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="2" fill="#ff69b4" />
                        <circle cx={x} cy={y} r="1" fill="#ffb6c1" />
                      </g>
                    );
                  })
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Environmental Effects */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Rain */}
          {isRaining && (
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-blue-300 opacity-60 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '1px',
                    height: `${6 + Math.random() * 10}px`,
                    animation: `raindrop ${0.4 + Math.random() * 0.6}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Night effects */}
          {isNight && (
            <div className="absolute inset-0">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    boxShadow: '0 0 8px #fef08a',
                    animation: `firefly ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Day effects */}
          {!isNight && (
            <div className="absolute inset-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-slate-600 text-sm"
                  style={{
                    left: `${Math.random() * 80}%`,
                    top: `${10 + Math.random() * 30}%`,
                    animation: `bird ${4 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 4}s`
                  }}
                >
                  🐦
                </div>
              ))}
            </div>
          )}

          {/* Butterflies for healthy trees */}
          {health > 70 && !isNight && (stage === 'tree' || stage === 'ancient') && (
            <div className="absolute inset-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-lg"
                  style={{
                    left: `${35 + Math.random() * 30}%`,
                    top: `${35 + Math.random() * 30}%`,
                    animation: `butterfly ${3 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                >
                  🦋
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health indicator */}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 z-40">
          <div className="flex items-center gap-3">
            <Heart
              className={`w-6 h-6 ${health > 70 ? 'text-green-400' : health > 40 ? 'text-yellow-400' : 'text-red-400'}`}
            />
            <div className="text-white font-bold text-lg">{health}%</div>
          </div>
        </div>

        {/* Growth stage indicator */}
        <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 z-40">
          <div className="text-white font-semibold capitalize">{stage}</div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
        @keyframes raindrop {
          0% { transform: translateY(-100vh); opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0.2; }
        }
        
        @keyframes firefly {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(15px, -10px) scale(1.2); opacity: 1; }
        }
        
        @keyframes bird {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(20px) translateY(-10px); }
        }
        
        @keyframes butterfly {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -15px) scale(1.1); }
          66% { transform: translate(-8px, -20px) scale(0.9); }
        }
      `}</style>
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
    <div
      className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl group cursor-pointer`}
      style={{
        background: environmentState.timeOfDay === 'day' ? 'rgba(255,255,255,0.97)' : undefined,
        color: environmentState.timeOfDay === 'day' ? '#222' : undefined
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon
            className={`w-8 h-8 ${color} ${animate ? 'animate-bounce' : ''} transition-transform duration-300 group-hover:scale-110`}
            style={{ color: environmentState.timeOfDay === 'day' ? '#222' : undefined }}
          />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        </div>
        <div className={`text-3xl font-bold mb-1 tracking-tight ${environmentState.timeOfDay === 'day' ? 'text-black' : 'text-white'}`}>{value}</div>
        <div className={`text-sm font-medium ${environmentState.timeOfDay === 'day' ? 'text-gray-700' : 'text-white/80'}`}>{label}</div>
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

  // Removed loading spinner and blue background for instant display
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
      <EmergencySupport />
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
            {garden?.activities && garden.activities.length > 0 ? (
              garden.activities.map((activity, index) => {
                let icon = BookOpen, color = 'text-slate-400', action = '';
                if (activity.type === 'journal') {
                  icon = BookOpen; color = 'text-slate-400'; action = 'Completed daily reflection';
                } else if (activity.type === 'mood') {
                  icon = Heart; color = 'text-red-400'; action = 'Logged emotional state';
                } else if (activity.type === 'game') {
                  icon = Gamepad2; color = 'text-purple-400'; action = 'Finished cognitive training';
                } else if (activity.type === 'resource') {
                  icon = Library; color = 'text-cyan-400'; action = 'Read mental health article';
                } else if (activity.type === 'checkin') {
                  icon = Calendar; color = 'text-indigo-400'; action = 'Checked in';
                }
                // Format time (simple)
                const timeAgo = (() => {
                  const now = new Date();
                  const ts = new Date(activity.timestamp);
                  const diffMs = now.getTime() - ts.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins < 60) return `${diffMins} min ago`;
                  const diffHours = Math.floor(diffMins / 60);
                  if (diffHours < 24) return `${diffHours} hr ago`;
                  const diffDays = Math.floor(diffHours / 24);
                  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                })();
                return (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {icon && <icon className={`w-6 h-6 ${color}`} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{action}</div>
                      <div className="text-white/60 text-sm">{timeAgo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+{activity.points}</div>
                      <div className="text-white/60 text-sm">vitality</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-white/60 text-center py-8">No recent activity yet.</div>
            )}
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