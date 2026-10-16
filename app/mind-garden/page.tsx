'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaHeart as Heart,
  FaBookOpen as BookOpen,
  FaGamepad as Gamepad2,
  FaBook as Library,
  FaTrophy as Trophy,
  FaBullseye as Target,
  FaCalendarDays as Calendar,
  FaFire as Flame,
  FaDroplet as Droplets,
  FaArrowTrendUp as TrendingUp,
  FaAward as Award,
  FaStar as Star,
  FaBolt as Zap,
  FaLeaf as Leaf,
} from 'react-icons/fa6';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';
import { getGardenSoilMoisture, getGardenVitality } from '@/lib/mindGardenVitals';

interface MindGarden {
  id: string;
  treeHealth: number;
  treeStage: string;
  streak: number;
  totalPoints: number;
  lastNurturedAt: string;
  soilQuality: number;
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
  const [garden, setGarden] = useState<MindGarden | null>(null);
  const [stats, setStats] = useState<GrowthStats | null>(null);

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGardenLoaded, setIsGardenLoaded] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [gardenTime, setGardenTime] = useState(0);
  const [environmentState, setEnvironmentState] = useState({
    timeOfDay: 'day',
    weather: 'clear',
    season: 'spring',
    windIntensity: 0.3
  });

  useEffect(() => {
    const updateEnvironment = () => {
      const date = new Date();
      const month = date.getMonth();
      const hour = date.getHours();
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000));
      const weatherCycle = dayOfYear % 9;
      const season = month >= 2 && month <= 4
        ? 'spring'
        : month >= 5 && month <= 7
          ? 'summer'
          : month >= 8 && month <= 10
            ? 'autumn'
            : 'winter';

      setEnvironmentState({
        timeOfDay: hour < 5 || hour >= 20 ? 'night' : hour < 7 || hour >= 17 ? 'sunset' : 'day',
        weather: weatherCycle === 3 || weatherCycle === 4 ? 'rain' : weatherCycle === 5 ? 'cloudy' : 'clear',
        season,
        windIntensity: 0.15 + (weatherCycle % 4) * 0.12,
      });
      setGardenTime(date.getTime());
    };

    updateEnvironment();
    const interval = setInterval(updateEnvironment, 60_000);
    return () => clearInterval(interval);
  }, []);

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
          setMessage(res.status === 401
            ? 'Please sign in to see your Mind Garden.'
            : 'Failed to load your Mind Garden.');
          return;
        }
        const data = await res.json();
        if (!data.success || !data.data?.garden || !data.data?.stats) {
          setMessage('Received invalid data from the server.');
          return;
        }
        setGarden(data.data.garden);
        setStats(data.data.stats);
      } catch {
        setMessage('Failed to load your Mind Garden.');
      } finally {
        setIsGardenLoaded(true);
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
      const waterData = await waterRes.json();
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
      if (!data.success || !data.data?.garden || !data.data?.stats) {
        console.error('Unexpected API response after watering:', data);
        setMessage('Received invalid data from the server after watering.');
        setIsLoading(false);
        return;
      }
      setGarden(data.data.garden);
      setStats(data.data.stats);
      setGardenTime(Date.now());
      setMessage(waterData.message || 'Your garden has been nurtured.');
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage('Failed to water your tree.');
    }
    setIsLoading(false);
  };

  // --- UI rendering helpers ---
  // Use garden and stats state
  const gardenData = garden;
  const rawRecentActivities: ActivityLog[] = gardenData?.activities || [];

  interface RealisticTreeVisualizationProps {
    health: number;
    stage: string;
    soilQuality: number;
    environment: {
      timeOfDay: string;
      weather: string;
      season: string;
      windIntensity: number;
    };
  }

  const RealisticTreeVisualization = ({ health, stage, soilQuality, environment }: RealisticTreeVisualizationProps) => {
    const svgWidth = 400;
    const svgHeight = 440;
    const groundY = 395;
    const [prevStage, setPrevStage] = useState(stage);
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
      if (stage === prevStage) return;
      setAnimating(true);
      const timeout = setTimeout(() => {
        setAnimating(false);
        setPrevStage(stage);
      }, 900);
      return () => clearTimeout(timeout);
    }, [stage, prevStage]);

    const vitality = Math.max(0, Math.min(health, 100)) / 100;
    const healthScale = 0.88 + vitality * 0.12;
    const healthyFoliage = ['#315B3B', '#477447', '#62874F', '#809B5D'];
    const autumnFoliage = ['#A95F38', '#C1813F', '#D19A4D', '#7B7847'];
    const winterFoliage = ['#596D54', '#69795B', '#82866A'];
    const dryFoliage = ['#8D6845', '#A77A49', '#77694C'];
    const foliagePalette = vitality < 0.28
      ? dryFoliage
      : environment.season === 'autumn'
        ? autumnFoliage
        : environment.season === 'winter'
          ? winterFoliage
          : healthyFoliage;
    const leafCoverage = environment.season === 'winter' ? 0.52 : 1;
    const flowerColors = ['#F5D77C', '#E39B83', '#D7E5B5', '#F7F2DD'];
    const fruitColors = ['#A94C3B', '#D48B46', '#7A9A58', '#E2B965'];
    const randomFor = (index: number, salt = 0) => {
      const value = Math.sin((index + 1) * 127.1 + (salt + 1) * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    const stages = {
      seed: { trunk: 0, canopy: 0, roots: 0, branches: 0 },
      sprout: { trunk: 18, canopy: 16, roots: 22, branches: 0 },
      sapling: { trunk: 70, canopy: 50, roots: 48, branches: 2 },
      youngTree: { trunk: 110, canopy: 72, roots: 68, branches: 3 },
      matureTree: { trunk: 150, canopy: 90, roots: 90, branches: 3 },
      ancientTree: { trunk: 215, canopy: 130, roots: 120, branches: 4 },
      legendaryTree: { trunk: 260, canopy: 160, roots: 150, branches: 5 },
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
        color: '#6D442C',
      },
      canopy: {
        size: currentStage.canopy * healthScale,
        color: foliagePalette[1],
        opacity: 0.18 + vitality * 0.82,
      },
      roots: {
        spread: currentStage.roots * healthScale,
        depth: Math.max(18, currentStage.roots * 0.5 * healthScale),
      },
      branches: currentStage.branches
    };
    const isNight = environment.timeOfDay === 'night';
    const isRaining = environment.weather === 'rain';
    const isCloudy = environment.weather === 'cloudy';

    return (
      <div
        className={`garden-scene relative w-full transition-all duration-700 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
        style={{ height: 'clamp(460px, 52vw, 600px)' }}
      >
        {/* Sky Background */}
        <div className={`absolute inset-0 transition-all duration-[10000ms] ${isNight
          ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-800'
          : isCloudy
            ? 'bg-gradient-to-b from-slate-300 via-slate-200 to-sky-100'
            : environment.timeOfDay === 'sunset'
              ? 'bg-gradient-to-b from-orange-300 via-rose-200 to-sky-100'
              : 'bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100'
          }`} style={{ height: svgHeight }} />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 440"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="garden-hill-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNight ? '#334b46' : '#a3b99b'} />
              <stop offset="100%" stopColor={isNight ? '#263b37' : '#829b79'} />
            </linearGradient>
            <linearGradient id="garden-hill-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNight ? '#283d35' : '#748b5f'} />
              <stop offset="100%" stopColor={isNight ? '#1f312b' : '#536a48'} />
            </linearGradient>
            <radialGradient id="garden-sun-glow">
              <stop offset="0%" stopColor="#fff6c9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fff6c9" stopOpacity="0" />
            </radialGradient>
          </defs>
          {!isNight ? (
            <>
              <circle cx="1010" cy="86" r="72" fill="url(#garden-sun-glow)" />
              <circle cx="1010" cy="86" r="25" fill="#FFF1B5" opacity={isCloudy ? 0.55 : 0.95} />
            </>
          ) : (
            <>
              <circle cx="1010" cy="86" r="26" fill="#F0EDCF" opacity="0.9" />
              <circle cx="1020" cy="78" r="24" fill="#343d55" />
              {Array.from({ length: 18 }).map((_, i) => (
                <circle
                  key={i}
                  cx={70 + randomFor(i, 12) * 1060}
                  cy={28 + randomFor(i, 13) * 160}
                  r={0.8 + randomFor(i, 14) * 1.2}
                  fill="#FFF6D6"
                  opacity={0.45 + randomFor(i, 15) * 0.45}
                />
              ))}
            </>
          )}
          {isCloudy && (
            <g fill="#F2F3E9" opacity="0.55">
              <ellipse cx="260" cy="100" rx="78" ry="20" />
              <ellipse cx="305" cy="91" rx="45" ry="28" />
              <ellipse cx="348" cy="102" rx="58" ry="19" />
              <ellipse cx="795" cy="145" rx="66" ry="17" />
              <ellipse cx="837" cy="137" rx="40" ry="24" />
              <ellipse cx="878" cy="146" rx="48" ry="16" />
            </g>
          )}
          <path d="M0 276 Q160 210 320 262 T640 250 T960 257 T1200 225 V440 H0Z" fill="url(#garden-hill-back)" />
          <path d="M0 322 Q180 250 360 306 T720 296 T1040 306 T1200 280 V440 H0Z" fill="url(#garden-hill-front)" />
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 18 + i * 56;
            const y = 320 + randomFor(i, 21) * 54;
            const size = 16 + randomFor(i, 22) * 18;
            return (
              <g key={i} opacity={0.45 + randomFor(i, 23) * 0.25}>
                <path d={`M${x} ${y + 18} v-${size}`} stroke={isNight ? '#263b32' : '#435c3e'} strokeWidth="5" />
                <circle cx={x} cy={y} r={size * 0.58} fill={isNight ? '#314b3d' : '#536e4b'} />
                <circle cx={x - size * 0.36} cy={y + size * 0.18} r={size * 0.42} fill={isNight ? '#354f40' : '#668156'} />
                <circle cx={x + size * 0.34} cy={y + size * 0.2} r={size * 0.4} fill={isNight ? '#2c4438' : '#5b754b'} />
              </g>
            );
          })}
          {isRaining && (
            <path d="M0 286 Q220 264 440 292 T880 280 T1200 292 V440 H0Z" fill="#283d35" opacity="0.13" />
          )}
        </svg>

        {/* Moist earth and layered grass frame the tree roots. */}
        <div className="absolute left-0 right-0" style={{
          bottom: 0, height: 64, zIndex: 20,
          background: isRaining
            ? 'linear-gradient(to bottom, #536f4a 0%, #526146 20%, #594232 52%, #443225 100%)'
            : `linear-gradient(to bottom, #718d58 0%, #637849 19%, ${soilQuality < 35 ? '#9a7950' : '#684b34'} 48%, #453226 100%)`,
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          boxShadow: '0 -4px 24px 0 rgba(41,58,34,0.24)'
        }}>
          {/* Grass surface */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '12px',
            background: isRaining ? '#607b4f' : soilQuality < 35 ? '#9b8d59' : '#78945d',
            opacity: 0.96,
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          }} />
          {/* Grass blades */}
          <svg width="100%" height="18" viewBox="0 0 800 18" style={{ position: 'absolute', top: 0, left: 0 }}>
            {Array.from({ length: 200 }).map((_, i) => {
              const x = (i * 4) + randomFor(i, 1) * 2;
              const height = 6 + randomFor(i, 2) * 10;
              const curve = randomFor(i, 3) * 3 - 1.5;
              const opacity = 0.45 + randomFor(i, 4) * 0.45;
              return (
                <path
                  key={i}
                  d={`M${x} 16 Q${x + curve} ${16 - height} ${x + curve * 0.5} ${14 - height}`}
                  stroke={soilQuality < 35 ? '#9b8d59' : '#819c63'}
                  strokeWidth="1"
                  fill="none"
                  opacity={opacity}
                />
              );
            })}
          </svg>
        </div>

        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 1200 440"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ zIndex: 25 }}
        >
          {Array.from({ length: 18 }).map((_, i) => {
            const side = i < 9 ? 1 : -1;
            const localIndex = i % 9;
            const x = side > 0 ? 55 + localIndex * 34 : 845 + localIndex * 34;
            const stemHeight = 18 + randomFor(i, 71) * 28;
            const flowerY = 386 - stemHeight;
            const flowerColor = flowerColors[i % flowerColors.length];
            return (
              <g key={i} opacity={soilQuality < 25 ? 0.48 : 0.92}>
                <path d={`M${x} 395 Q${x - 3} 378 ${x} ${flowerY + 5}`} fill="none" stroke={soilQuality < 25 ? '#88764D' : '#526F43'} strokeWidth="2" />
                <ellipse cx={x - 5} cy={flowerY + 15} rx="7" ry="3" fill="#6E8A50" transform={`rotate(-28 ${x - 5} ${flowerY + 15})`} />
                {i % 4 !== 0 ? (
                  <>
                    <circle cx={x} cy={flowerY} r="4" fill={flowerColor} />
                    <circle cx={x - 4} cy={flowerY + 1} r="3.5" fill={flowerColor} />
                    <circle cx={x + 4} cy={flowerY + 1} r="3.5" fill={flowerColor} />
                    <circle cx={x} cy={flowerY + 4} r="3.5" fill={flowerColor} />
                    <circle cx={x} cy={flowerY + 1} r="1.8" fill="#E6C775" />
                  </>
                ) : (
                  <ellipse cx={x} cy={flowerY} rx="3" ry="5" fill={flowerColor} />
                )}
              </g>
            );
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const side = i < 6 ? 1 : -1;
            const localIndex = i % 6;
            const x = side > 0 ? 95 + localIndex * 35 : 875 + localIndex * 35;
            const y = 377 + randomFor(i, 72) * 18;
            const radius = 10 + randomFor(i, 73) * 8;
            return <circle key={i} cx={x} cy={y} r={radius} fill={i % 2 ? '#536F46' : '#637D4F'} opacity="0.9" />;
          })}
        </svg>

        {/* Tree Visualization, base always at groundY */}
        <div className="absolute left-1/2" style={{ bottom: 0, transform: 'translateX(-50%)', zIndex: 30 }}>
          <svg
            className="garden-tree-svg"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ animationDuration: `${7 - environment.windIntensity * 3}s` }}
          >
            <defs>
              <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#593923" />
                <stop offset="28%" stopColor="#8E5D37" />
                <stop offset="52%" stopColor="#A9774B" />
                <stop offset="76%" stopColor="#71462B" />
                <stop offset="100%" stopColor="#50341F" />
              </linearGradient>
              <radialGradient id="canopyGradient" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor={foliagePalette[2]} stopOpacity={tree.canopy.opacity} />
                <stop offset="80%" stopColor={foliagePalette[0]} stopOpacity={tree.canopy.opacity * 0.8} />
                <stop offset="100%" stopColor={foliagePalette[0]} stopOpacity={tree.canopy.opacity * 0.45} />
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
                      stroke="#68452F"
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
                <ellipse cx="200" cy={groundY + 18} rx="6" ry="9" fill="#DB9558" />
                <ellipse cx="200" cy={groundY + 16} rx="4" ry="6" fill="#A8BBA3" />
              </g>
            )}

            {/* GERMINATION STAGE - Roots growing */}
            {stage === 'germination' && (
              <g>
                {/* Seed with crack, grounded at y=groundY */}
                <ellipse cx="200" cy={groundY} rx="6" ry="9" fill="#DB9558" />
                <path d={`M194 ${groundY} L206 ${groundY}`} stroke="#97A87A" strokeWidth="1" />
                {/* Small root tip */}
                <path d={`M200 ${groundY + 9} Q198 ${groundY + 15} 195 ${groundY + 20}`} stroke="#A8BBA3" strokeWidth="2" fill="none" />
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
                  fill="#97A87A"
                  rx="2"
                />
                {/* First tiny leaves */}
                <ellipse cx="195" cy={groundY - tree.trunk.height} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
                <ellipse cx="205" cy={groundY - tree.trunk.height - 2} rx="8" ry="4" fill={tree.canopy.color} opacity="0.9" />
                {/* Visible roots */}
                <path d={`M200 ${groundY} Q195 ${groundY + 10} 190 ${groundY + 20}`} stroke="#DB9558" strokeWidth="2" fill="none" />
                <path d={`M200 ${groundY} Q205 ${groundY + 10} 210 ${groundY + 20}`} stroke="#DB9558" strokeWidth="2" fill="none" />
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
                    stroke="#8A5E3B"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                ))}
                {/* Branches - improved angles and base position */}
                {Array.from({ length: tree.branches }).map((_, i) => {
                  const angle = tree.branches === 1 ? 270 : 220 + i * (100 / (tree.branches - 1));
                  const length = 38 * healthScale + tree.trunk.height * 0.22;
                  const x1 = 200;
                  const branchHeight = tree.branches === 1 ? 0.76 : 0.48 + (i / (tree.branches - 1)) * 0.4;
                  const y1 = groundY - tree.trunk.height * branchHeight;
                  const x2 = x1 + Math.cos((angle * Math.PI) / 180) * length;
                  const y2 = y1 + Math.sin((angle * Math.PI) / 180) * length * 0.72;
                  return (
                    <g key={i}>
                      <path
                        d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - length * 0.08} ${x2} ${y2}`}
                        stroke="#765033"
                        strokeWidth={Math.max(1.1, 4.2 - i * 0.42)}
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
                            fill={foliagePalette[(i + j) % foliagePalette.length]}
                            opacity={0.55 + 0.35 * randomFor(i * 20 + j, 5)}
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
                  opacity={tree.canopy.opacity}
                />
                {Array.from({ length: Math.max(5, Math.round(34 * (0.18 + vitality * 0.82) * leafCoverage)) }).map((_, i) => {
                  const angle = i * 2.399963;
                  const radius = Math.sqrt((i + 0.5) / 36) * tree.canopy.size * 0.42;
                  const x = 200 + Math.cos(angle) * radius;
                  const y = groundY - tree.trunk.height - tree.canopy.size * 0.5 + Math.sin(angle) * radius * 0.7;
                  const leafSize = 9 + randomFor(i, 6) * 9;
                  const droop = (1 - vitality) * 13;
                  return (
                    <ellipse
                      key={i}
                      cx={x}
                      cy={y + droop}
                      rx={leafSize * 1.2}
                      ry={leafSize}
                      fill={foliagePalette[i % foliagePalette.length]}
                      opacity={Math.max(0.18, 0.82 - (1 - vitality) * 0.48)}
                      transform={`rotate(${Math.sin(angle) * 24 + droop} ${x} ${y + droop})`}
                    />
                  );
                })}
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
                        fill={foliagePalette[i % foliagePalette.length]}
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
                        r={5 + randomFor(i, 7) * 2}
                        fill={flowerColors[i % flowerColors.length]}
                        opacity="0.85"
                        stroke="#FCF9EA"
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
                        r={4 + randomFor(i, 8) * 2}
                        fill={fruitColors[i % fruitColors.length]}
                        opacity="0.9"
                        stroke="#FCF9EA"
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
                      stroke="#785239"
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
                    left: `${randomFor(i, 31) * 100}%`,
                    top: `${randomFor(i, 32) * 100}%`,
                    width: '1px',
                    height: `${6 + randomFor(i, 33) * 10}px`,
                    animation: `raindrop ${0.4 + randomFor(i, 34) * 0.6}s linear infinite`,
                    animationDelay: `${randomFor(i, 35) * 2}s`
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
                    left: `${20 + randomFor(i, 41) * 60}%`,
                    top: `${20 + randomFor(i, 42) * 60}%`,
                    boxShadow: '0 0 8px #FCF9EA',
                    animation: `firefly ${3 + randomFor(i, 43) * 2}s ease-in-out infinite`,
                    animationDelay: `${randomFor(i, 44) * 3}s`
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
                    left: `${randomFor(i, 51) * 80}%`,
                    top: `${10 + randomFor(i, 52) * 30}%`,
                    animation: `bird ${4 + randomFor(i, 53) * 2}s ease-in-out infinite`,
                    animationDelay: `${randomFor(i, 54) * 4}s`
                  }}
                >
                  <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
                    <path d="M1 8 Q5 2 10 7 Q15 2 19 8" fill="none" stroke={isCloudy ? '#56625b' : '#39473d'} strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Butterflies for healthy trees: show for matureTree, ancientTree, legendaryTree, and tree */}
          {health > 70 && !isNight && (stage === 'tree' || stage === 'ancient' || stage === 'matureTree' || stage === 'ancientTree' || stage === 'legendaryTree') && (
            <div className="absolute inset-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-lg"
                  style={{
                    left: `${35 + randomFor(i, 61) * 30}%`,
                    top: `${35 + randomFor(i, 62) * 30}%`,
                    animation: `butterfly ${3 + randomFor(i, 63) * 2}s ease-in-out infinite`,
                    animationDelay: `${randomFor(i, 64) * 3}s`
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M8.5 8.5C5 1 1 2 2 6c.6 2.2 3 3.1 6.5 3.2C5 9.4 3 11 4 13c1 2 3.2.7 5-3.2 1.8 3.9 4 5.2 5 3.2 1-2-1-3.6-4.5-3.8C13 9.1 15.4 8.2 16 6c1-4-3-5-6.5 2.5Z" fill="#D99B73" stroke="#7A6048" strokeWidth="0.7" />
                    <path d="M9 7v5" stroke="#624C3A" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health indicator */}
        <div className="garden-scene-badge absolute top-4 right-4 backdrop-blur-sm rounded-xl p-3 z-40">
          <div className="flex items-center gap-3">
            <Heart
              className="w-6 h-6"
              style={{ color: health > 70 ? '#b7d08f' : health > 40 ? '#f0cf79' : '#e98d72' }}
            />
            <div className="font-bold text-lg">{health}%</div>
          </div>
        </div>

        {/* Growth stage indicator */}
        <div className="garden-scene-badge absolute top-4 left-4 backdrop-blur-sm rounded-xl p-3 z-40">
          <div className="font-semibold capitalize">{stage.replace(/([A-Z])/g, ' $1')}</div>
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
  }

  const EnhancedStatCard = ({ icon: Icon, value, label, color }: EnhancedStatCardProps) => (
    <div className="garden-stat-card">
      <Icon className={`garden-stat-icon ${color}`} aria-hidden="true" />
      <div className="garden-stat-value">{value}</div>
      <div className="garden-stat-label">{label}</div>
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

  if (!garden || !stats) {
    return (
      <div className="min-h-screen bg-white">
        <EmergencySupport />
        <Navbar />
        <main className="member-page-content">
          <section className="member-page-header">
            <span className="member-page-eyebrow">Your personal growing space</span>
            <h1>Mind <span className="member-heading-accent">Garden</span></h1>
            <p role="status">
              {isGardenLoaded ? message || 'Your garden could not be loaded. Please try again.' : 'Preparing your garden...'}
            </p>
            {isGardenLoaded && message.includes('sign in') ? (
              <Link className="dashboard-primary-action" href="/login?next=%2Fmind-garden">
                Sign in to view your garden
              </Link>
            ) : isGardenLoaded ? (
              <button className="dashboard-primary-action" onClick={() => window.location.reload()}>
                Try loading again
              </button>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  // --- Growth stage thresholds and health calculation ---
  const points = garden.totalPoints || 0;
  let treeStage = 'seed';
  if (points >= 10000) treeStage = 'legendaryTree';
  else if (points >= 4000) treeStage = 'ancientTree';
  else if (points >= 1500) treeStage = 'matureTree';
  else if (points >= 600) treeStage = 'youngTree';
  else if (points >= 200) treeStage = 'sapling';
  else if (points >= 50) treeStage = 'sprout';
  const health = gardenTime
    ? getGardenVitality(garden.lastNurturedAt, new Date(gardenTime))
    : garden.treeHealth;
  const soilMoisture = gardenTime
    ? getGardenSoilMoisture(garden.lastNurturedAt, new Date(gardenTime))
    : garden.soilQuality;
  // --- Activity point allocation logic ---
  const activityPointsMap: Record<string, { points: number; label: string }> = {
    journal: { points: 10, label: 'Journal written' },
    journal_written: { points: 10, label: 'Journal written' },
    mood: { points: 5, label: 'Mood checked' },
    mood_logged: { points: 5, label: 'Mood checked' },
    game: { points: 5, label: 'Played game' },
    resource: { points: 8, label: 'Read resource' },
    checkin: { points: 5, label: 'Daily check-in' },
    water: { points: 5, label: 'Tree watered' },
    tree_watered: { points: 5, label: 'Tree watered' },
  };
  // Ensure all activities have correct points and label
  const recentActivities: (ActivityLog & { label: string })[] = Array.isArray(rawRecentActivities)
    ? rawRecentActivities.map((a: ActivityLog) => {
      const base = activityPointsMap[a.type] || { points: a.points || 0, label: a.type };
      return { ...a, points: base.points, label: base.label };
    })
    : [];

  // Only the garden area changes night/day, the rest of the page is always light
  return (
    <div className="min-h-screen bg-white">
      <EmergencySupport />
      <Navbar />
      <main className="member-page-content space-y-8">
        {/* Main Tree Display */}
        {/* Garden visualization area (only this changes night/day) */}
        <section className="garden-experience-card">
          <div className="garden-experience-heading">
            <div>
              <span className="member-page-eyebrow">A living garden, shaped by your care</span>
              <h1>Your Mind <span className="member-heading-accent">Garden</span></h1>
              <p>
                {treeStage.replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase())} · {environmentState.season} · {environmentState.weather}
              </p>
              <p>
                Journal entries, mood check-ins, completed games, and daily watering help it grow.
                Soil dries first; leaves gradually wilt if your garden goes untended.
              </p>
            </div>
            <div className={`garden-vitality-badge ${health <= 30 ? 'is-thirsty' : ''}`}>
              <Heart aria-hidden="true" />
              <span>{health}% vitality</span>
            </div>
          </div>
          <div className="garden-scene-shell">
            <RealisticTreeVisualization
              health={health}
              stage={treeStage}
              soilQuality={soilMoisture}
              environment={environmentState}
            />
          </div>
          <div className="garden-stat-grid">
            <EnhancedStatCard icon={Flame} value={garden.streak} label="Day streak" color="text-orange-700" />
            <EnhancedStatCard icon={Leaf} value={garden.totalPoints.toLocaleString()} label="Growth points" color="text-green-700" />
            <EnhancedStatCard icon={Droplets} value={`${soilMoisture}%`} label="Soil moisture" color="text-blue-700" />
            <EnhancedStatCard icon={Heart} value={`${health}%`} label="Plant vitality" color="text-red-700" />
          </div>
          <div className="garden-care-row">
            <p>
              {health >= 75
                ? 'Your garden is thriving. Gentle care keeps it flourishing.'
                : health >= 35
                  ? 'Your garden is beginning to wilt. A little care will help it recover.'
                  : 'Your garden is very dry and needs care. Reconnecting helps it recover.'}
            </p>
            <button
              onClick={handleWaterTree}
              disabled={isLoading}
              className="garden-water-button"
            >
              <Droplets aria-hidden="true" />
              <span>{isLoading ? 'Nurturing your garden…' : 'Water your garden'}</span>
              {isLoading && <span className="garden-button-spinner" aria-hidden="true" />}
            </button>
          </div>
          {message && <p className="garden-feedback" role="status">{message}</p>}
        </section>

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
                <span className="text-lg text-green-800">Plant vitality</span>
                <span className="text-xl font-bold text-green-900">{health}/100</span>
              </div>
              <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${health}%` }}
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
                  <div className="text-green-700">{Math.max(0, stats.nextMilestone.points - garden.totalPoints).toLocaleString()} points remaining</div>
                </div>
              </div>
              <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-2000 shadow-lg"
                  style={{ width: `${Math.min(100, (garden.totalPoints / stats.nextMilestone.points) * 100)}%` }}
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
            points={10}
            color="from-orange-500 to-yellow-200"
            description="Write your thoughts"
          />
          <ActionCard
            href="/mood"
            icon={Heart}
            title="Mood Check"
            points={5}
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
            points={8}
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
                <span className="font-bold">How your garden grows:</span> Journal entries (+10), mood check-ins (+5), completed games (+5), and daily watering (+5) add lasting growth. Soil moisture falls after half a day without care, and vitality begins to fade after a full day.
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
                garden.achievements.slice(0, 3).map((ach, idx) => (
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
              {garden.achievements && garden.achievements.length > 3 && (
                <button className="mt-4 px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg font-semibold" onClick={() => setShowAchievements(true)}>
                  View All
                </button>
              )}
            </div>
            {/* Modal for all achievements */}
            {showAchievements && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-h-[80vh] w-full max-w-xl overflow-y-auto shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-900">All Achievements & Rewards</h2>
                  <div className="space-y-2">
                    {garden.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-2 rounded-xl bg-yellow-50">
                        <span className="text-2xl">{ach.icon || '🏅'}</span>
                        <div className="flex-1">
                          <div className="font-bold text-yellow-900">{ach.title}</div>
                          <div className="text-yellow-700 text-xs">{ach.description}</div>
                          <div className="text-yellow-500 text-xs">{(ach.rarity ? ach.rarity.charAt(0).toUpperCase() + ach.rarity.slice(1) : 'Common')} • {new Date(ach.unlockedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg font-semibold w-full" onClick={() => setShowAchievements(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
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
              recentActivities.slice(0, 3).map((activity, index) => {
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
            {recentActivities.length > 3 && (
              <button className="mt-4 px-4 py-2 bg-blue-200 text-blue-900 rounded-lg font-semibold" onClick={() => setShowActivities(true)}>
                View All
              </button>
            )}
          </div>
          {/* Modal for all activities */}
          {showActivities && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }}>
              <div className="bg-white rounded-2xl p-8 max-h-[80vh] w-full max-w-xl overflow-y-auto shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center">All Growth Activities</h2>
                <div className="space-y-2">
                  {recentActivities.map((activity, index) => {
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
                      <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center`}>
                          {icon && React.createElement(icon, { className: `w-5 h-5 ${color}` })}
                        </div>
                        <div className="flex-1">
                          <div className="text-blue-900 font-semibold">{activity.label}</div>
                          <div className="text-blue-500 text-xs">{timeAgo}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-bold">+{activity.points}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="mt-6 px-4 py-2 bg-blue-200 text-blue-900 rounded-lg font-semibold w-full" onClick={() => setShowActivities(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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
