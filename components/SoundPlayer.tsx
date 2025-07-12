'use client';

import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';

interface SoundPlayerProps {
  src: string;
  loop?: boolean;
}

export default function SoundPlayer({ src, loop = false }: SoundPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
      audioRef.current.volume = 0.3;
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [loop]);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.error('Audio playback error:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-4 right-4 glass-card p-3 rounded-full text-slate-600 hover:text-blue-600 transition-colors"
    >
      <audio ref={audioRef} src={src} />
      {isPlaying ? (
        <Volume2 className="w-6 h-6" />
      ) : (
        <VolumeX className="w-6 h-6" />
      )}
    </button>
  );
}