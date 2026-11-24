import Image from 'next/image';

interface MoodEmojiProps {
  mood: number;
  size?: number;
}

export const MOOD_IMAGE_PATHS = [
  '/images/emotions/terrible.png',
  '/images/emotions/very%20sad.png',
  '/images/emotions/sad.png',
  '/images/emotions/down.png',
  '/images/emotions/neutral.png',
  '/images/emotions/okay.png',
  '/images/emotions/good.png',
  '/images/emotions/great.png',
  '/images/emotions/amazing.png',
  '/images/emotions/incredible.png',
] as const;

export function getMoodImagePath(mood: number): string {
  const level = Math.max(1, Math.min(10, Math.round(mood)));
  return MOOD_IMAGE_PATHS[level - 1];
}

export default function MoodEmoji({ mood, size = 40 }: MoodEmojiProps) {
  const level = Math.max(1, Math.min(10, Math.round(mood)));

  return (
    <Image
      src={getMoodImagePath(level)}
      alt={`Mood ${level} out of 10`}
      width={size}
      height={size}
      draggable={false}
      style={{ objectFit: 'contain' }}
    />
  );
}
