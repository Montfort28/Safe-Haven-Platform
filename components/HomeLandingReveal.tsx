'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const title = 'Safe Haven';

export default function HomeLandingReveal() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const heading = titleRef.current;
    const progress = progressRef.current;
    const wordmark = document.querySelector<HTMLElement>('.home-brand .brand-wordmark');
    if (!root || !backdrop || !heading || !progress) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalWordmarkOpacity = wordmark?.style.opacity;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;
    const introDuration = reducedMotion ? 1250 : 2150;
    const exitDuration = reducedMotion ? 560 : 900;
    const animations: Animation[] = [];

    body.style.overflow = 'hidden';
    if (scrollbarCompensation > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarCompensation}px`;
    }
    root.style.setProperty('--landing-duration', `${introDuration}ms`);
    wordmark?.style.setProperty('opacity', '0');

    const finishIntro = () => {
      if (!root.isConnected) return;

      const start = heading.getBoundingClientRect();
      const destination = wordmark?.getBoundingClientRect();
      heading.style.position = 'fixed';
      heading.style.left = `${start.left}px`;
      heading.style.top = `${start.top}px`;
      heading.style.width = `${start.width}px`;
      heading.style.transform = 'none';
      heading.style.transformOrigin = 'top left';

      const translateX = destination ? destination.left - start.left : 0;
      const translateY = destination ? destination.top - start.top : -window.innerHeight;
      const scaleX = destination ? destination.width / start.width : 0.35;
      const scaleY = destination ? destination.height / start.height : 0.35;
      const landingTransform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

      animations.push(
        heading.animate(
          [
            { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 },
            { offset: 0.78, transform: landingTransform, opacity: 1 },
            { transform: landingTransform, opacity: 0 },
          ],
          {
            duration: exitDuration,
            easing: reducedMotion ? 'ease-out' : 'cubic-bezier(0.7, 0, 0.2, 1)',
            fill: 'forwards',
          },
        ),
      );

      animations.push(
        backdrop.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(-102%)' }],
          {
            duration: exitDuration,
            easing: reducedMotion ? 'ease-out' : 'cubic-bezier(0.76, 0, 0.24, 1)',
            fill: 'forwards',
          },
        ),
      );

      animations.push(
        progress.animate(
          [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -16px' }],
          { duration: exitDuration * 0.48, easing: 'ease-in', fill: 'forwards' },
        ),
      );

      if (wordmark) {
        animations.push(
          wordmark.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: exitDuration * 0.64,
            duration: exitDuration * 0.36,
            easing: 'ease-out',
            fill: 'forwards',
          }),
        );
      }

      window.setTimeout(() => {
        setVisible(false);
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
        if (wordmark) wordmark.style.opacity = originalWordmarkOpacity ?? '';
      }, exitDuration + 40);
    };

    const timer = window.setTimeout(finishIntro, introDuration);
    return () => {
      window.clearTimeout(timer);
      animations.forEach(animation => animation.cancel());
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
      if (wordmark) wordmark.style.opacity = originalWordmarkOpacity ?? '';
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="home-landing-reveal"
      role="status"
      aria-label="Loading Safe Haven"
    >
      <div ref={backdropRef} className="home-landing-backdrop" />
      <div className="home-landing-content">
        <div className="home-landing-wordmark-lockup">
          <h1 ref={titleRef} className="home-landing-title" aria-label="Safe Haven">
            {Array.from(title).map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={`home-landing-letter${letter === ' ' ? ' is-space' : ''}`}
                aria-hidden="true"
                style={{ '--letter-index': index } as CSSProperties}
              >
                {letter === ' ' ? '\u00a0' : letter}
              </span>
            ))}
          </h1>
        </div>
        <div ref={progressRef} className="home-landing-progress" aria-hidden="true">
          <span className="home-landing-progress-fill" />
        </div>
      </div>
    </div>
  );
}