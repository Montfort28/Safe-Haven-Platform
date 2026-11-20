'use client';

import { useEffect, useState } from 'react';
import FoldText from '@/components/FoldText';

const ROTATING_WORDS = ['reset', 'heal', 'grow'];
const ROTATION_INTERVAL = 6000;

export default function HeroRotatingWord() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const word = ROTATING_WORDS[currentIndex];

  useEffect(() => {
    const handleRevealStart = () => setStarted(true);
    window.addEventListener('safe-haven:landing-reveal-start', handleRevealStart);
    return () => window.removeEventListener('safe-haven:landing-reveal-start', handleRevealStart);
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const timer = window.setTimeout(
      () => setCurrentIndex(index => (index + 1) % ROTATING_WORDS.length),
      ROTATION_INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [currentIndex, started]);

  return (
    <FoldText
      key={currentIndex}
      className="home-hero-fold-title home-hero-fold-title-accent hero-rotating-fold"
      text={word}
      splitBy="char"
      trigger={started ? 'mount' : 'landing'}
      foldStyle="paper"
      hinge="top"
      duration={0.85}
      stagger={0.045}
      staggerFrom="start"
      foldAngle={88}
      perspective={700}
      creaseShading={0.35}
      fontSize="clamp(3.05rem, 4.7vw, 4.45rem)"
      fontWeight={700}
      color="var(--brand-orange-dark)"
    />
  );
}
