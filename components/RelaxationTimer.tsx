'use client';

import { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';

export default function RelaxationTimer() {
  const [time, setTime] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      alert('Meditation session complete! Take a deep breath.');
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-6 text-center max-w-md mx-auto mt-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Relaxation Timer</h3>
      <p className="text-4xl font-bold text-slate-700 dark:text-gray-300 mb-6">{formatTime(time)}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className="btn-primary flex items-center gap-2 px-4 py-2 transition-all duration-300 hover:shadow-lg"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
      <p className="text-sm text-slate-600 dark:text-gray-400 mt-4">A 5-minute guided relaxation session.</p>
    </div>
  );
}