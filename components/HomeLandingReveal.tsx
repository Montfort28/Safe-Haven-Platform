'use client';

import { useEffect, useRef, useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

export default function HomeLandingReveal() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const wordmark = wordmarkRef.current;
    const counter = counterRef.current;
    if (!root || !backdrop || !wordmark || !counter) return undefined;

    const logo = root.querySelector<HTMLSpanElement>('.home-landing-logo');
    const homeLogo = document.querySelector<HTMLElement>('.home-brand .brand-logo');
    if (!logo) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const body = document.body;
    const html = document.documentElement;
    const originalOverflow = body.style.overflow;
    const originalHtmlOverflow = html.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalLogoOpacity = homeLogo?.style.opacity;
    const scrollbarCompensation = window.innerWidth - html.clientWidth;
    const introDuration = reducedMotion ? 1250 : 2850;
    const exitDuration = reducedMotion ? 560 : 900;
    const animations: Animation[] = [];

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    if (scrollbarCompensation > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarCompensation}px`;
    }
    homeLogo?.style.setProperty('opacity', '0');

    let countFrame = 0;
    let countStartedAt: number | undefined;
    const countDuration = reducedMotion ? 1500 : 3500;
    const updateCounts = (now: number) => {
      if (countStartedAt === undefined) countStartedAt = now;
      const progress = Math.max(0, Math.min((now - countStartedAt) / countDuration, 1));
      setCount(Math.floor(100 * progress));
      if (progress < 1) countFrame = window.requestAnimationFrame(updateCounts);
    };
    countFrame = window.requestAnimationFrame(updateCounts);

    const finishIntro = () => {
      if (!root.isConnected) return;

      const start = logo.getBoundingClientRect();
      const destination = homeLogo?.getBoundingClientRect();
      logo.style.position = 'fixed';
      logo.style.left = `${start.left}px`;
      logo.style.top = `${start.top}px`;
      logo.style.width = `${start.width}px`;
      logo.style.transform = 'none';
      logo.style.transformOrigin = 'top left';

      const translateX = destination ? destination.left - start.left : 0;
      const translateY = destination ? destination.top - start.top : -window.innerHeight;
      const scaleX = destination ? destination.width / start.width : 0.35;
      const scaleY = destination ? destination.height / start.height : 0.35;
      const landingTransform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

      animations.push(
        logo.animate(
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
        wordmark.animate(
          [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -10px' }],
          {
            duration: exitDuration * 0.32,
            easing: 'ease-in',
            fill: 'forwards',
          },
        ),
      );

      animations.push(
        counter.animate(
          [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 12px' }],
          { delay: exitDuration * 0.84, duration: exitDuration * 0.16, easing: 'ease-in', fill: 'forwards' },
        ),
      );

      if (homeLogo) {
        animations.push(
          homeLogo.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: exitDuration * 0.64,
            duration: exitDuration * 0.36,
            easing: 'ease-out',
            fill: 'forwards',
          }),
        );
      }

      window.setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new Event('safe-haven:landing-reveal-complete'));
        body.style.overflow = originalOverflow;
        html.style.overflow = originalHtmlOverflow;
        body.style.paddingRight = originalPaddingRight;
        if (homeLogo) homeLogo.style.opacity = originalLogoOpacity ?? '';
      }, exitDuration + 40);
    };

    const timer = window.setTimeout(finishIntro, introDuration);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(countFrame);
      animations.forEach(animation => animation.cancel());
      body.style.overflow = originalOverflow;
      html.style.overflow = originalHtmlOverflow;
      body.style.paddingRight = originalPaddingRight;
      if (homeLogo) homeLogo.style.opacity = originalLogoOpacity ?? '';
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
          <BrandLogo className="home-landing-logo" />
          <div className="home-landing-title-group">
            <span ref={wordmarkRef} className="home-landing-wordmark">
              Safe Haven
            </span>
          </div>
        </div>
      </div>
      <div ref={counterRef} className="home-landing-counter" aria-hidden="true">
        {count.toString().padStart(3, '0')}
      </div>
    </div>
  );
}