'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FoldText from '@/components/FoldText';

import './HeroRotatingWord.css';

const ROTATING_WORDS = ['begin', 'reset', 'grow'];
const ROTATION_INTERVAL = 6000;
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function HeroRotatingWord() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [wordWidth, setWordWidth] = useState(null);
  const highlightRef = useRef(null);
  const wordRef = useRef(null);
  const word = ROTATING_WORDS[currentIndex];

  useEffect(() => {
    const handleRevealComplete = () => setStarted(true);
    window.addEventListener('safe-haven:landing-reveal-complete', handleRevealComplete);
    return () => window.removeEventListener('safe-haven:landing-reveal-complete', handleRevealComplete);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const wordElement = wordRef.current;
    if (!wordElement) return undefined;

    const measure = () => {
      const fontSize = Number.parseFloat(window.getComputedStyle(wordElement).fontSize) || 16;
      setWordWidth(wordElement.getBoundingClientRect().width + fontSize * 0.1);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(wordElement);
    return () => observer?.disconnect();
  }, [word]);

  useIsomorphicLayoutEffect(() => {
    const highlight = highlightRef.current;
    if (!highlight || !started) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(highlight, {
        '--hero-smear-fold': '0deg',
        '--hero-smear-opacity': 1,
      });
      return undefined;
    }

    const tween = gsap.fromTo(
      highlight,
      {
        '--hero-smear-fold': '88deg',
        '--hero-smear-opacity': 0,
      },
      {
        '--hero-smear-fold': '0deg',
        '--hero-smear-opacity': 1,
        duration: 0.85,
        ease: 'power3.out',
      },
    );
    return () => tween.kill();
  }, [currentIndex, started]);

  useEffect(() => {
    if (!started) return undefined;

    const timer = window.setTimeout(
      () => setCurrentIndex(index => (index + 1) % ROTATING_WORDS.length),
      ROTATION_INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [currentIndex, started]);

  return (
    <span
      ref={highlightRef}
      className="hero-rotating-highlight"
      style={{
        ...(wordWidth === null ? {} : { width: `${wordWidth}px` }),
        '--hero-smear-fold': started ? '0deg' : '88deg',
        '--hero-smear-opacity': started ? 1 : 0,
      }}
      aria-label={word}
    >
      <span ref={wordRef} className="hero-rotating-word" aria-hidden="true">
        <FoldText
          key={currentIndex}
          className="hero-rotating-fold"
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
          fontSize="inherit"
          fontWeight={700}
          color="#25332D"
        />
      </span>
    </span>
  );
}
