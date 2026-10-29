import type { CSSProperties } from 'react';

type HomeWaveProps = {
  className?: string;
  /** Background colour of the section this wave belongs to (the section below the curve). */
  color: string;
  /** "paper" adds the grain texture used on cream sections; "ink" is a flat dark fill. */
  tone?: 'paper' | 'ink';
};

/**
 * Curved top edge for a home page section. It is drawn with the section's own
 * background and overlaps the bottom of the previous section, so the curve
 * flows into the section below without a visible seam or contrasting band.
 */
export default function HomeWave({ className = '', color, tone = 'paper' }: HomeWaveProps) {
  return (
    <div
      className={`home-wave home-wave-${tone} ${className}`}
      style={{ '--wave-color': color } as CSSProperties}
      aria-hidden="true"
    />
  );
}