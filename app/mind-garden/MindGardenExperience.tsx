'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBookOpen, FaHeart, FaGamepad, FaLeaf, FaDroplet, FaArrowRight } from 'react-icons/fa6';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';
import GardenTree from '@/components/mind-garden/GardenTree';
import {
  getGardenCondition,
  getGardenGrowthProgress,
  type GardenCondition,
  type GardenStageId,
} from '@/lib/mindGardenGrowth';

interface GardenActivity {
  type: string;
  points: number;
  timestamp: string;
}

interface GardenData {
  totalPoints: number;
  lastNurturedAt: string;
  condition: GardenCondition;
  activities: GardenActivity[];
}

function getAuthorizationHeaders(): HeadersInit {
  const token = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('token='))
    ?.split('=')[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
}

const stageDescriptions: Record<GardenStageId, string> = {
  seedling: 'A small beginning, held gently in the soil.',
  growing: 'New branches are reaching toward the light.',
  flourishing: 'A fuller canopy is taking shape, one moment at a time.',
  thriving: 'A steady, generous tree with room for continued growth.',
};

const activities = [
  {
    href: '/journal',
    title: 'Write in your journal',
    description: 'Make space for your thoughts and reflections.',
    points: 10,
    frequency: 'Up to 2 entries a day',
    Icon: FaBookOpen,
  },
  {
    href: '/mood',
    title: 'Check in with yourself',
    description: 'A check-in counts for showing up, whatever you feel.',
    points: 5,
    frequency: 'Once a day',
    Icon: FaHeart,
  },
  {
    href: '/games',
    title: 'Complete a calming exercise',
    description: 'Finish a wellbeing activity at your own pace.',
    points: 5,
    frequency: 'Up to 3 completions a day',
    Icon: FaGamepad,
  },
  {
    href: '/resources',
    title: 'Explore a resource',
    description: 'Open an article or resource that feels useful.',
    points: 8,
    frequency: 'Up to 5 resources a day',
    Icon: FaLeaf,
  },
];

export default function MindGardenExperience() {
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadGarden = useCallback(async () => {
    const response = await fetch('/api/mind-garden/stats', {
      headers: getAuthorizationHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to visit your Mind Garden.');
      }
      throw new Error('Your garden could not be loaded. Please try again.');
    }

    const result = await response.json();
    if (!result.success || !result.data?.garden) {
      throw new Error('Your garden returned an unexpected response. Please try again.');
    }

    const data = result.data.garden;
    setGarden({
      totalPoints: Number(data.totalPoints) || 0,
      lastNurturedAt: data.lastNurturedAt,
      condition: data.condition,
      activities: Array.isArray(data.activities) ? data.activities : [],
    });
  }, []);

  useEffect(() => {
    let active = true;

    loadGarden()
      .catch((error: unknown) => {
        if (active) {
          const message = error instanceof Error ? error.message : 'Your garden could not be loaded.';
          setErrorMessage(message);
        }
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [loadGarden]);

  const handleTendGarden = async () => {
    setIsWatering(true);
    setNotice('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/mind-garden/water', {
        method: 'POST',
        headers: getAuthorizationHeaders(),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Your garden could not be tended right now.');
      }

      await loadGarden();
      setNotice(result.message || 'You spent a moment tending your garden.');
    } catch (error) {
      console.error('Unable to tend the Mind Garden:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Your garden could not be tended right now.');
    } finally {
      setIsWatering(false);
    }
  };

  if (!garden) {
    return (
      <div className="min-h-screen bg-white">
        <EmergencySupport />
        <Navbar />
        <main className="member-page-content garden-page">
          <section className="garden-empty-state" role="status">
            <span className="member-page-eyebrow">A quiet place to pause</span>
            <h1>Your Mind <span className="member-heading-accent">Garden</span></h1>
            <p>{isLoaded ? errorMessage || 'Your garden could not be loaded.' : 'Preparing your garden…'}</p>
            {isLoaded && errorMessage.includes('sign in') ? (
              <Link className="dashboard-primary-action" href="/login?next=%2Fmind-garden">
                Sign in to visit your garden
              </Link>
            ) : isLoaded ? (
              <button
                className="garden-secondary-button"
                onClick={() => {
                  setIsLoaded(false);
                  setErrorMessage('');
                  loadGarden()
                    .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Your garden could not be loaded.'))
                    .finally(() => setIsLoaded(true));
                }}
              >
                Try again
              </button>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  const growth = getGardenGrowthProgress(garden.totalPoints);
  const condition = garden.condition || getGardenCondition(garden.lastNurturedAt);
  const stageName = growth.stage.name;

  return (
    <div className="min-h-screen bg-white">
      <EmergencySupport />
      <Navbar />
      <main className="member-page-content garden-page">
        <section className="garden-experience-card">
          <header className="garden-experience-heading">
            <div>
              <span className="member-page-eyebrow">A quiet place to pause</span>
              <h1>Your Mind <span className="member-heading-accent">Garden</span></h1>
              <p>Your garden grows with moments of care. It will be here whenever you return.</p>
            </div>
            <span className="garden-condition-pill">
              <FaLeaf aria-hidden="true" />
              {condition === 'resting' ? 'Resting quietly' : condition === 'recovering' ? 'Returning gently' : 'At ease'}
            </span>
          </header>

          <div className="garden-scene-shell">
            <div className="garden-scene" role="img" aria-label={`${stageName} tree in a peaceful garden`}>
              <svg className="garden-landscape" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e9eadb" />
                    <stop offset=".72" stopColor="#e4e7d6" />
                    <stop offset="1" stopColor="#c8d2b0" />
                  </linearGradient>
                  <linearGradient id="garden-meadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#879b6c" />
                    <stop offset="1" stopColor="#687b56" />
                  </linearGradient>
                  <linearGradient id="garden-soil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8a7255" />
                    <stop offset="1" stopColor="#66503d" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="600" fill="url(#garden-sky)" />
                <circle cx="935" cy="137" r="78" fill="#f0d99f" opacity=".48" />
                <path d="M0 388C146 323 277 350 402 397c131 49 257 20 373-33 139-63 279-54 425 13v130H0Z" fill="#aebc91" opacity=".72" />
                <path d="M0 429c148-47 250-14 383 26 144 43 282 25 415-13 145-41 275-34 402 8v108H0Z" fill="#879b70" />
                <path d="M0 514c183-24 309-7 455 12 176 23 335 17 489-2 105-13 183-17 256-10v86H0Z" fill="url(#garden-meadow)" />
                <path d="M0 555c223-12 374-4 570 5 205 9 421-9 630-4v44H0Z" fill="url(#garden-soil)" />
                <path d="M0 555c185-11 352-1 542 7 220 9 443-9 658-5" fill="none" stroke="#a4aa77" strokeWidth="5" opacity=".72" />
                <path d="M96 545c6-16 12-16 18 0m44 6c4-13 9-15 15-5m731 1c5-16 11-17 17 0m69 0c4-13 10-14 16-2" fill="none" stroke="#c2c28c" strokeWidth="3" strokeLinecap="round" opacity=".8" />
              </svg>
              <GardenTree stage={growth.stage.id} condition={condition} />
              <span className="garden-scene-caption">{stageName}</span>
            </div>
          </div>

          <div className="garden-progress-panel">
            <div className="garden-progress-copy">
              <div>
                <span className="garden-section-kicker">Your garden, today</span>
                <h2>{stageName}</h2>
                <p>{stageDescriptions[growth.stage.id]}</p>
              </div>
              {growth.nextStage ? (
                <span className="garden-progress-remaining">
                  {growth.pointsToNextStage} more to {growth.nextStage.name} · starts at {growth.nextStage.threshold}
                </span>
              ) : (
                <span className="garden-progress-remaining">A full-grown garden</span>
              )}
            </div>
            <div
              className="garden-progress-track"
              role="progressbar"
              aria-label={`Progress toward ${growth.nextStage?.name ?? 'a full-grown garden'}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={growth.progressPercent}
            >
              <span style={{ width: `${growth.progressPercent}%` }} />
            </div>
            <p className="garden-progress-footnote">
              {growth.nextStage
                ? `${growth.progressPercent}% of the way to ${growth.nextStage.name}`
                : 'Your tree has reached its thriving stage.'}
            </p>
          </div>
        </section>

        <section className="garden-activities-section" aria-labelledby="garden-activities-title">
          <div className="garden-section-heading">
            <div>
              <span className="garden-section-kicker">Small moments count</span>
              <h2 id="garden-activities-title">Ways your garden grows</h2>
              <p>Progress reflects completing an activity, never the mood you record.</p>
            </div>
          </div>
          <div className="garden-activity-grid">
            {activities.map(({ href, title, description, points, frequency, Icon }) => (
              <Link key={href} href={href} className="garden-activity-card">
                <span className="garden-activity-icon"><Icon aria-hidden="true" /></span>
                <span className="garden-activity-content">
                  <strong>{title}</strong>
                  <span>{description}</span>
                  <small>+{points} growth points · {frequency}</small>
                </span>
                <FaArrowRight className="garden-activity-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="garden-care-panel" aria-labelledby="garden-care-title">
          <div className="garden-care-copy">
            <span className="garden-section-kicker">Optional, never a requirement</span>
            <h2 id="garden-care-title">Pause and tend the garden</h2>
            <p>A small, optional moment of care adds 5 growth points, up to once a day. There are no streaks, and taking a break never harms your tree.</p>
          </div>
          <button className="garden-water-button" onClick={handleTendGarden} disabled={isWatering}>
            <FaDroplet aria-hidden="true" />
            <span>{isWatering ? 'A moment…' : 'Tend the garden'}</span>
          </button>
          {(notice || errorMessage) && (
            <p className={`garden-feedback${errorMessage ? ' is-error' : ''}`} role="status">
              {errorMessage || notice}
            </p>
          )}
        </section>

        <p className="garden-reassurance">
          Your garden does not shrink when you take time away. Opening this page does not add progress.
        </p>
      </main>
    </div>
  );
}
