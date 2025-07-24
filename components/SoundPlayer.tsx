'use client';

import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';

interface SoundPlayerProps {
  src: string;
  loop?: boolean;
}

export default function SoundPlayer({ src, loop = false }: SoundPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);
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

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && isLoaded) {
        audioRef.current.play().catch((err) => console.error('Audio playback error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isLoaded]);


  const toggleSound = () => {
    // Always toggle isPlaying for immediate icon feedback
    setIsPlaying((prev) => !prev);
    // If not loaded, set isLoaded to true to allow playback attempt
    if (!isLoaded) setIsLoaded(true);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setLoadError(true)}
        hidden
      />
      <button
        onClick={toggleSound}
        className="fixed bottom-20 left-4 glass-card p-3 rounded-full text-slate-600 hover:text-blue-600 transition-colors"
        aria-label={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
        disabled={loadError}
      >
        {loadError ? (
          <span title="Audio file not supported or missing" className="text-red-600">⚠️</span>
        ) : isPlaying ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </button>
      {loadError && (
        <div className="fixed bottom-20 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
          Audio file not supported or missing: <span className="font-mono">{src}</span>
        </div>
      )}
    </>
  );
}