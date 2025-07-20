'use client';

import React from 'react';
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
  type: string; // Accept any backend activity type
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
  // --- Automatic day/night switching based on local time ---
  // DEMO: Switch day/night every 10 seconds with a smooth transition
  useEffect(() => {
    let isNight = false;
    const interval = setInterval(() => {
      isNight = !isNight;
      setEnvironmentState((prev) => ({ ...prev, timeOfDay: isNight ? 'night' : 'day' }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);
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

  // --- Fetch garden and stats data on mount ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        const res = await fetch('/api/mind-garden/stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setMessage('Failed to load your Mind Garden.');
          return;
        }
        const data = await res.json();
        let gardenData = null;
        let statsData = null;
        // Accept stats-only response
        if (data.garden && data.stats) {
          gardenData = data.garden;
          statsData = data.stats;
        } else if (data.success && data.data && data.data.garden && data.data.stats) {
          gardenData = data.data.garden;
          statsData = data.data.stats;
        } else if (data.success && data.data && data.data.todayPoints !== undefined) {
          // Only stats present, no garden data: show error and do not show fake garden
          setMessage('No Mind Garden data found. Please complete activities (journal, mood, games, resources) to start growing your garden!');
          setGarden(null);
          setStats(null);
          return;
        } else {
          setMessage('Received invalid data from the server.');
          return;
        }
        setGarden(gardenData);
        setStats(statsData);
      } catch (err) {
        setMessage('Failed to load your Mind Garden.');
      }
    };
    fetchData();
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
      } else if (data.success && data.data && typeof data.data === 'object') {
        // Accept fallback: if only stats, create fallback garden
        statsData = data.data;
        gardenData = {
          id: 'unknown',
          treeHealth: 100,
          treeStage: 'seed',
          streak: 0,
          totalPoints: 0,
          lastWatered: '',
          soilQuality: 100,
          sunlightHours: 8,
          achievements: [],
          weeklyGrowth: [],
          activities: []
        };
        setMessage('Garden data missing. Showing stats only.');
      } else {
        console.error('Unexpected API response after watering:', data);
        setMessage('Received invalid data from the server after watering.');
        setIsLoading(false);
        return;
      }
      setGarden(gardenData);
      setStats(statsData);
      setMessage('Your tree feels refreshed and vibrant!');
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Failed to water your tree.');
    }
    setIsLoading(false);
  };

  // --- Helper: determine tree stage based on points ---
  // More gradual, realistic growth stages
  const getTreeStage = (points: number) => {
    if (points < 50) return 'seed';
    if (points < 200) return 'sprout';
    if (points < 600) return 'sapling';
    if (points < 1500) return 'youngTree';
    if (points < 4000) return 'matureTree';
    if (points < 10000) return 'ancientTree';
    return 'legendaryTree';
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
    const svgWidth = 400;
    const svgHeight = 440;
    const groundY = 395;
    const [glow, setGlow] = useState(false);
    const [prevStage, setPrevStage] = useState(stage);
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
      if (glow) {
        const timeout = setTimeout(() => setGlow(false), 1200);
        return () => clearTimeout(timeout);
      }
    }, [glow]);
    // Animate on stage change
    useEffect(() => {
      if (stage !== prevStage) {
        setAnimating(true);
        setTimeout(() => {
          setAnimating(false);
          setPrevStage(stage);
        }, 900);
      }
    }, [stage, prevStage]);

    const healthScale = 0.7 + 0.45 * Math.max(0, Math.min(health, 100)) / 100;
    const healthColor = health > 80 ? '#22c55e' : health > 60 ? '#84cc16' : health > 40 ? '#eab308' : '#ef4444';
    // Helper for extra details
    const flowerColors = ['#fbbf24', '#f472b6', '#a3e635', '#f87171', '#60a5fa'];
    const fruitColors = ['#f87171', '#fbbf24', '#a3e635', '#f472b6'];
    // ...existing getTreeElements logic...
    const stages = {
      seed: { trunk: 0, canopy: 0, roots: 0, branches: 0 },
      sprout: { trunk: 18, canopy: 16, roots: 22, branches: 0 },
      sapling: { trunk: 50, canopy: 32, roots: 38, branches: 1 },
      youngTree: { trunk: 90, canopy: 54, roots: 60, branches: 2 },
      matureTree: { trunk: 150, canopy: 90, roots: 90, branches: 3 },
      ancientTree: { trunk: 210, canopy: 120, roots: 120, branches: 4 },
      legendaryTree: { trunk: 260, canopy: 150, roots: 150, branches: 5 },
      tree: { trunk: 120, canopy: 70, roots: 70, branches: 2 }
    };
    type StageKey = keyof typeof stages;
    const validStages = Object.keys(stages) as StageKey[];
    let safeStage: StageKey = validStages.includes(stage as StageKey) ? (stage as StageKey) : 'seed';
    if (stage === 'tree') safeStage = 'tree';
    if (stage === 'ancient') safeStage = 'ancientTree';
    const currentStage = stages[safeStage];
    const tree = {
      trunk: {
        height: currentStage.trunk * healthScale,
        width: Math.max(6, currentStage.trunk * 0.13 * healthScale),
        color: '#8b4513',
      },
      canopy: {
        size: currentStage.canopy * healthScale,
        color: healthColor,
        opacity: Math.max(0.7, health / 100),
      },
      roots: {
        spread: currentStage.roots * healthScale,
        depth: Math.max(18, currentStage.roots * 0.5 * healthScale),
      },
      branches: currentStage.branches
    };
    const isNight = environment.timeOfDay === 'night';
    const isRaining = environment.weather === 'rain';

    return (
      <div className={`relative w-full transition-all duration-700 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} style={{ height: svgHeight }}>
        {/* Sky Background */}
        <div className={`absolute inset-0 transition-all duration-[10000ms] ${isNight
          ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-800'
          : 'bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100'
          }`} style={{ height: svgHeight }} />

        {/* Ground Layer as a styled div */}
        <div className="absolute left-0 right-0" style={{
          bottom: 0, height: 64, zIndex: 20,
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

        {/* Tree Visualization, base always at groundY */}
        <div className="absolute left-1/2" style={{ bottom: 0, transform: 'translateX(-50%)', zIndex: 30 }}>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
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
                  const y = groundY + Math.sin(angle * Math.PI / 180) * (tree.roots.depth);
                  return (
                    <path
                      key={i}
                      d={`M200 ${groundY} Q${200 + (x - 200) * 0.6} ${groundY + (y - groundY) * 0.8} ${x} ${y}`}
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
                <ellipse cx="200" cy={groundY + 18} rx="6" ry="9" fill="#8b4513" />
                <ellipse cx="200" cy={groundY + 16} rx="4" ry="6" fill="#cd853f" />
              </g>
            )}

            {/* GERMINATION STAGE - Roots growing */}
            {stage === 'germination' && (
              <g>
                {/* Seed with crack, grounded at y=groundY */}
                <ellipse cx="200" cy={groundY} rx="6" ry="9" fill="#8b4513" />
                <path d={`M194 ${groundY} L206 ${groundY}`} stroke="#4a7c59" strokeWidth="1" />
                {/* Small root tip */}
                <path d={`M200 ${groundY + 9} Q198 ${groundY + 15} 195 ${groundY + 20}`} stroke="#cd853f" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* SPROUT STAGE - First stem and leaves, strictly grounded at y=groundY */}
            {stage === 'sprout' && (
              <g>
                {/* Tiny stem, base at y=groundY */}
                <rect
                  x="198"
                  y={groundY - tree.trunk.height}
                  width="4"
                  height={tree.trunk.height}
                  fill="#4a7c59"
                  rx="2"
                />
                {/* First tiny leaves */}
                <ellipse cx="195" cy={groundY - tree.trunk.height} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
                <ellipse cx="205" cy={groundY - tree.trunk.height - 2} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
                {/* Visible roots */}
                <path d={`M200 ${groundY} Q195 ${groundY + 10} 190 ${groundY + 20}`} stroke="#8b4513" strokeWidth="2" fill="none" />
                <path d={`M200 ${groundY} Q205 ${groundY + 10} 210 ${groundY + 20}`} stroke="#8b4513" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* SAPLING, TREE, AND ABOVE - Realistic tree, strictly grounded at y=groundY, with more detail */}
            {(stage === 'sapling' || stage === 'tree' || stage === 'youngTree' || stage === 'matureTree' || stage === 'ancientTree' || stage === 'legendaryTree') && (
              <g>
                {/* Trunk */}
                <rect
                  x={200 - tree.trunk.width / 2}
                  y={groundY - tree.trunk.height}
                  width={tree.trunk.width}
                  height={tree.trunk.height}
                  fill="url(#trunkGradient)"
                  rx={tree.trunk.width / 8}
                />
                {/* Bark texture */}
                {Array.from({ length: Math.floor(tree.trunk.height / 14) }).map((_, i) => (
                  <line
                    key={i}
                    x1={200 - tree.trunk.width / 2 + 1}
                    y1={groundY - i * 14}
                    x2={200 + tree.trunk.width / 2 - 1}
                    y2={groundY - i * 14}
                    stroke="#543821"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                ))}
                {/* Branches - improved angles and base position */}
                {Array.from({ length: tree.branches }).map((_, i) => {
                  const spread = tree.branches === 1 ? 0 : tree.branches === 2 ? 60 : 90;
                  const baseAngle = -spread / 2;
                  const angle = baseAngle + i * (spread / (tree.branches - 1 || 1));
                  const length = 38 * healthScale + tree.trunk.height * 0.22;
                  const x1 = 200;
                  const y1 = groundY - tree.trunk.height * 0.85;
                  const x2 = x1 + Math.cos((angle * Math.PI) / 180) * length;
                  const y2 = y1 + Math.sin((angle * Math.PI) / 180) * length * 0.7;
                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#7c4a03"
                        strokeWidth={2.2 - i * 0.3}
                        opacity="0.7"
                        strokeLinecap="round"
                      />
                      {/* Add leaves to branches */}
                      {Array.from({ length: 2 + Math.floor(tree.canopy.size / 16) }).map((_, j) => {
                        const leafAngle = angle + (j - 1) * 18;
                        const leafLen = length * (0.7 + 0.15 * j);
                        const lx = x1 + Math.cos((leafAngle * Math.PI) / 180) * leafLen;
                        const ly = y1 + Math.sin((leafAngle * Math.PI) / 180) * leafLen * 0.7;
                        return (
                          <ellipse
                            key={j}
                            cx={lx}
                            cy={ly}
                            rx={6 + tree.canopy.size / 16}
                            ry={10 + tree.canopy.size / 18}
                            fill="#4caf50"
                            opacity={0.7 + 0.2 * Math.random()}
                            transform={`rotate(${leafAngle} ${lx} ${ly})`}
                          />
                        );
                      })}
                    </g>
                  );
                })}
                {/* Canopy */}
                <ellipse
                  cx="200"
                  cy={groundY - tree.trunk.height - tree.canopy.size / 2}
                  rx={tree.canopy.size / 2 + tree.branches * 2}
                  ry={tree.canopy.size / 2}
                  fill="url(#canopyGradient)"
                  style={glow ? { filter: 'drop-shadow(0 0 32px #fef08a)' } : {}}
                />
                {/* Extra foliage for mature/ancient/legendary trees */}
                {(stage === 'matureTree' || stage === 'ancientTree' || stage === 'legendaryTree') && (
                  Array.from({ length: 5 + tree.branches }).map((_, i) => {
                    const angle = i * (360 / (5 + tree.branches));
                    const distance = tree.canopy.size / 2 + 10;
                    const x = 200 + Math.cos(angle * Math.PI / 180) * distance;
                    const y = (groundY - tree.trunk.height - tree.canopy.size / 2) + Math.sin(angle * Math.PI / 180) * (tree.canopy.size / 2);
                    return (
                      <ellipse
                        key={i}
                        cx={x}
                        cy={y}
                        rx={tree.canopy.size / 6}
                        ry={tree.canopy.size / 7}
                        fill="#43a047"
                        opacity="0.8"
                      />
                    );
                  })
                )}
                {/* Flowers for ancient/legendary */}
                {(stage === 'ancientTree' || stage === 'legendaryTree') && (
                  Array.from({ length: 6 + tree.branches }).map((_, i) => {
                    const angle = i * (360 / (6 + tree.branches));
                    const distance = tree.canopy.size / 2 + 18;
                    const x = 200 + Math.cos(angle * Math.PI / 180) * distance;
                    const y = (groundY - tree.trunk.height - tree.canopy.size / 2) + Math.sin(angle * Math.PI / 180) * (tree.canopy.size / 2);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={5 + Math.random() * 2}
                        fill={flowerColors[i % flowerColors.length]}
                        opacity="0.85"
                        stroke="#fff"
                        strokeWidth="1"
                      />
                    );
                  })
                )}
                {/* Fruits for legendary */}
                {stage === 'legendaryTree' && (
                  Array.from({ length: 5 + tree.branches }).map((_, i) => {
                    const angle = i * (360 / (5 + tree.branches));
                    const distance = tree.canopy.size / 2 + 8;
                    const x = 200 + Math.cos(angle * Math.PI / 180) * distance;
                    const y = (groundY - tree.trunk.height - tree.canopy.size / 2) + Math.sin(angle * Math.PI / 180) * (tree.canopy.size / 2);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y + 10}
                        r={4 + Math.random() * 2}
                        fill={fruitColors[i % fruitColors.length]}
                        opacity="0.9"
                        stroke="#fff"
                        strokeWidth="0.7"
                      />
                    );
                  })
                )}
                {/* Roots - always start at groundY and curve downward */}
                {Array.from({ length: 5 + tree.branches }).map((_, i, arr) => {
                  const spread = 120;
                  const baseAngle = -spread / 2;
                  const angle = baseAngle + i * (spread / (arr.length - 1));
                  const length = tree.roots.spread;
                  const x = 200 + Math.cos((angle * Math.PI) / 180) * length;
                  const y = groundY + Math.abs(Math.sin((angle * Math.PI) / 180)) * (tree.roots.depth + 10);
                  return (
                    <path
                      key={i}
                      d={`M200 ${groundY} Q${200 + (x - 200) * 0.4} ${groundY + 18} ${x} ${y}`}
                      stroke="#8b4513"
                      strokeWidth={1.7 - i * 0.13}
                      fill="none"
                      opacity="0.7"
                    />
                  );
                })}
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
      className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl group cursor-pointer`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Icon
            className={`w-8 h-8 ${color} ${animate ? 'animate-bounce' : ''} transition-transform duration-300 group-hover:scale-110`}
          />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        </div>
        <div className="text-3xl font-bold mb-1 tracking-tight text-slate-900">{value}</div>
        <div className="text-sm font-semibold text-slate-700">{label}</div>
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
      <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 text-center">
          <div className="mb-4">
            <Icon className="w-10 h-10 text-slate-900 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </div>
          <div className="text-slate-900 font-bold text-lg mb-2">{title}</div>
          <div className="text-slate-700 text-sm mb-2">{description}</div>
          <div className="text-green-700 text-xs font-bold">+{points} points</div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-200 rounded-full animate-pulse" />
        </div>
      </div>
    </Link>
  );

  // Removed loading spinner and blue background for instant display
  // Only show error if truly no garden and no stats
  if (!garden || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold">{message || 'No Mind Garden data found. Please complete activities (journal, mood, games, resources) to start growing your garden!'}</p>
        </div>
      </div>
    );
  }

  // --- Growth stage thresholds and health calculation ---
  const stageThresholds = [
    { stage: 'seed', min: 0, max: 50 },
    { stage: 'sprout', min: 50, max: 200 },
    { stage: 'sapling', min: 200, max: 600 },
    { stage: 'youngTree', min: 600, max: 1500 },
    { stage: 'matureTree', min: 1500, max: 4000 },
    { stage: 'ancientTree', min: 4000, max: 10000 },
    { stage: 'legendaryTree', min: 10000, max: 10000 }
  ];
  // Find current stage and next threshold
  const points = garden.totalPoints || 0;
  let treeStage = 'seed';
  let stageIdx = 0;
  for (let i = 0; i < stageThresholds.length; i++) {
    if (points >= stageThresholds[i].min) {
      treeStage = stageThresholds[i].stage;
      stageIdx = i;
    }
  }
  // Health is percent progress toward 10,000 points (Legendary Tree)
  let health = Math.floor((points / 10000) * 100);
  if (health > 100) health = 100;
  // --- Activity point allocation logic ---
  const activityPointsMap: Record<string, { points: number; label: string }> = {
    journal: { points: 25, label: 'Journal written' },
    mood: { points: 20, label: 'Mood checked' },
    game: { points: 5, label: 'Played game' },
    resource: { points: 15, label: 'Read resource' },
    checkin: { points: 10, label: 'Daily check-in' },
    water: { points: 5, label: 'Tree watered' },
  };
  // Ensure all activities have correct points and label
  const recentActivities = Array.isArray(garden.activities)
    ? garden.activities.map((a) => {
      const base = activityPointsMap[a.type] || { points: a.points || 0, label: a.type };
      return { ...a, points: base.points, label: base.label };
    })
    : [];

  // Optionally, fetch and show daily progress using stats if not already present
  // ...existing code...

  // Only the garden area changes night/day, the rest of the page is always light
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100">
      <EmergencySupport />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Main Tree Display */}
        {/* Garden visualization area (only this changes night/day) */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="p-8">
            <div className="flex justify-center items-center mb-6">
              {/* Title/stage division always static color */}
              <div className="text-center w-full">
                <h1 className="text-4xl font-bold mb-2 tracking-tight text-blue-900">Your Digital Sanctuary</h1>
                <p className="text-blue-700 text-lg">
                  Stage: <span className="capitalize text-green-400 font-semibold text-xl">{treeStage}</span>
                </p>
              </div>
            </div>
            {/* Plant health and growth strictly reflect user activity */}
            <RealisticTreeVisualization
              health={health}
              stage={treeStage}
              soilQuality={garden.soilQuality}
              sunlight={garden.sunlightHours}
              environment={environmentState}
            />

            {/* Stats cards - all values strictly from backend, no hardcoded/fake values */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <EnhancedStatCard
                icon={Flame}
                value={garden.streak}
                label="Day Streak"
                color="text-orange-700"
                gradient="from-orange-300 via-yellow-200 to-pink-200"
                animate={true}
              />
              <EnhancedStatCard
                icon={Star}
                value={garden.totalPoints.toLocaleString()}
                label="Total Points"
                color="text-yellow-700"
                gradient="from-yellow-300 via-orange-200 to-amber-200"
              />
              <EnhancedStatCard
                icon={Droplets}
                value={`${garden.soilQuality}%`}
                label="Soil Health"
                color="text-blue-700"
                gradient="from-blue-300 via-cyan-200 to-teal-200"
              />
              <EnhancedStatCard
                icon={Sun}
                value={`${garden.sunlightHours}h`}
                label="Daily Energy"
                color="text-green-700"
                gradient="from-green-300 via-emerald-200 to-teal-200"
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
        {/* Growth Analytics and Milestone - clear, light, visible, real data only */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unified card style and color for analytics and milestone */}
          <div className="rounded-3xl p-8 shadow-xl bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border border-green-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-900">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Growth Analytics
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg text-green-800">Sanctuary Progress</span>
                <span className="text-xl font-bold text-green-900">{garden.treeHealth}/100</span>
              </div>
              <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${garden.treeHealth}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-sm mb-1 text-green-700">Today</div>
                  <div className="text-2xl font-bold text-green-700">+{stats.todayPoints}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm mb-1 text-green-700">This Week</div>
                  <div className="text-2xl font-bold text-green-700">+{stats.weekPoints}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm mb-1 text-green-700">This Month</div>
                  <div className="text-2xl font-bold text-green-700">+{stats.monthPoints}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 shadow-xl bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border border-green-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-green-900">
              <Target className="w-6 h-6 text-green-500" />
              Next Milestone
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-100 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-green-700" />
                </div>
                <div>
                  <div className="font-bold text-lg text-green-900">{stats.nextMilestone.reward}</div>
                  <div className="text-green-700">{(stats.nextMilestone.points - garden.totalPoints).toLocaleString()} points remaining</div>
                </div>
              </div>
              <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${(garden.totalPoints / stats.nextMilestone.points) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Cards */}
        {/* Remove unused/unwanted cards, keep only real actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ActionCard
            href="/journal"
            icon={BookOpen}
            title="Write Journal"
            points={25}
            color="from-orange-500 to-yellow-200"
            description="Write your thoughts"
          />
          <ActionCard
            href="/mood"
            icon={Heart}
            title="Mood Check"
            points={20}
            color="from-pink-500 to-rose-200"
            description="Log your mood"
          />
          <ActionCard
            href="/games"
            icon={Gamepad2}
            title="Play Game"
            points={5}
            color="from-indigo-500 to-blue-200"
            description="Play a game"
          />
          <ActionCard
            href="/resources"
            icon={Library}
            title="Read Resource"
            points={15}
            color="from-cyan-500 to-teal-200"
            description="Read and learn"
          />
        </div>
        {/* Advanced Growth Metrics & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Timeline with real point allocation logic */}
          <div className="lg:col-span-2 rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border border-blue-200">
            <h3 className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-500" />
              Growth Timeline & Point Allocation
            </h3>
            <div className="space-y-6">
              {/* Show how points are earned and real milestones */}
              <div className="mb-4 text-blue-800 text-sm font-medium">
                <span className="font-bold">How points are earned:</span> Journal (+25), Mood Check (+20), Play Game (+5), Read Resource (+15), Daily Check-in (+10). Points are added to your total and help your plant grow. Inactivity causes health decay.
              </div>
              {[
                { stage: 'Seed', completed: garden.totalPoints >= 0, points: 0, description: 'Beginning of your journey', reward: '🌱 Welcome Badge' },
                { stage: 'Sprout', completed: garden.totalPoints >= 50, points: 50, description: 'First signs of growth', reward: '🥚 Sprout Award' },
                { stage: 'Sapling', completed: garden.totalPoints >= 200, points: 200, description: 'Steady development phase', reward: '🌿 Sapling Medal' },
                { stage: 'Young Tree', completed: garden.totalPoints >= 600, points: 600, description: 'Growing strong', reward: '🌳 Young Tree Trophy' },
                { stage: 'Mature Tree', completed: garden.totalPoints >= 1500, points: 1500, description: 'Mature and resilient', reward: '🏆 Maturity Ribbon' },
                { stage: 'Ancient Tree', completed: garden.totalPoints >= 4000, points: 4000, description: 'Wisdom and mastery', reward: '🦉 Wisdom Laurel' },
                { stage: 'Legendary Tree', completed: garden.totalPoints >= 10000, points: 10000, description: 'A legend in the garden', reward: '🌟 Legendary Crown' }
              ].map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className={`w-4 h-4 rounded-full ${milestone.completed
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-lg shadow-indigo-400/30'
                    : 'bg-white/20'
                    }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-bold text-lg text-blue-900`}>
                          {milestone.stage}
                        </div>
                        <div className="text-indigo-700 text-sm">{milestone.description}</div>
                        <div className="text-green-700 text-xs mt-1">Reward: {milestone.reward}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-indigo-900 font-extrabold">{milestone.points.toLocaleString()}</div>
                        <div className="text-indigo-700 text-sm">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Progress with real backend data */}
          <div className="rounded-3xl p-8 shadow-xl bg-gradient-to-br from-pink-100 via-rose-100 to-yellow-100 border border-pink-200">
            <h3 className="text-2xl font-extrabold text-pink-900 mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-500" />
              Daily Progress
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-pink-700 mb-2">{stats.todayPoints}</div>
                <div className="text-pink-900 font-bold">Points Today</div>
              </div>
              {/* Real activity data for today */}
              <div className="space-y-4">
                {recentActivities.filter(a => {
                  const today = new Date();
                  const ts = new Date(a.timestamp);
                  return ts.toDateString() === today.toDateString();
                }).length > 0 ? (
                  recentActivities.filter(a => {
                    const today = new Date();
                    const ts = new Date(a.timestamp);
                    return ts.toDateString() === today.toDateString();
                  }).map((activity, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-pink-700 font-bold capitalize">{activity.label}</span>
                      <span className="text-pink-700 font-bold">+{activity.points}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-pink-400 text-center">No activity yet today.</div>
                )}
              </div>
              <div className="pt-4 border-t border-pink-200">
                <div className="flex justify-between items-center text-lg font-extrabold">
                  <span className="text-pink-900">Potential Total</span>
                  <span className="text-pink-700">+{recentActivities.filter(a => {
                    const today = new Date();
                    const ts = new Date(a.timestamp);
                    return ts.toDateString() === today.toDateString();
                  }).reduce((sum, a) => sum + a.points, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Rewards */}
          <div className="rounded-3xl p-8 shadow-xl bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-50 border border-yellow-200">
            <h3 className="text-2xl font-extrabold text-yellow-900 mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Achievements & Rewards
            </h3>
            <div className="space-y-4">
              {garden.achievements && garden.achievements.length > 0 ? (
                garden.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/70 border border-yellow-100 shadow">
                    <span className="text-2xl">{ach.icon || '🏅'}</span>
                    <div className="flex-1">
                      <div className="font-bold text-yellow-900">{ach.title}</div>
                      <div className="text-yellow-700 text-xs">{ach.description}</div>
                      <div className="text-yellow-500 text-xs">{(ach.rarity ? ach.rarity.charAt(0).toUpperCase() + ach.rarity.slice(1) : 'Common')} • {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-yellow-400 text-center">No achievements yet. Keep growing your garden to unlock rewards!</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-gradient-to-br from-slate-100 via-blue-100 to-cyan-100 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-3xl">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Recent Growth Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                let icon = BookOpen, color = 'text-slate-400';
                if (activity.type === 'journal') {
                  icon = BookOpen; color = 'text-slate-400';
                } else if (activity.type === 'mood') {
                  icon = Heart; color = 'text-red-400';
                } else if (activity.type === 'game') {
                  icon = Gamepad2; color = 'text-purple-400';
                } else if (activity.type === 'resource') {
                  icon = Library; color = 'text-cyan-400';
                } else if (activity.type === 'checkin') {
                  icon = Calendar; color = 'text-indigo-400';
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
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 hover:bg-white/80 transition-all duration-300 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {icon && React.createElement(icon, { className: `w-6 h-6 ${color}` })}
                    </div>
                    <div className="flex-1">
                      <div className="text-blue-900 font-semibold">{activity.label}</div>
                      <div className="text-blue-500 text-sm">{timeAgo}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">+{activity.points}</div>
                      <div className="text-green-700 text-sm">progress</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-blue-400 text-center py-8">No recent activity yet.</div>
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

