interface MoodEmojiProps {
  mood: number;
  size?: number;
}

const MOOD_EMOJIS = ['😫', '😭', '😞', '😔', '😐', '🙂', '😊', '😄', '😁', '😆'];

export function getMoodEmoji(mood: number): string {
  const level = Math.max(1, Math.min(10, Math.round(mood)));
  return MOOD_EMOJIS[level - 1];
}

export default function MoodEmoji({ mood, size = 40 }: MoodEmojiProps) {
  const level = Math.max(1, Math.min(10, Math.round(mood)));
  const emoji = getMoodEmoji(level);

  return (
    <span
      role="img"
      aria-label={`Mood ${level} out of 10`}
      style={{
        display: 'inline-block',
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontSize: size,
        lineHeight: 1,
      }}
    >
      {emoji}
    </span>
  );
}
