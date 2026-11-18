'use client';

import { useEffect } from 'react';

const motionGroups: Array<[string, string, number]> = [
  ['.home-hero-copy h1', 'home-hero-title-in', 950],
  ['.home-hero-description', 'home-hero-copy-in', 900],
  ['.home-hero-actions', 'home-hero-actions-in', 850],
  ['.home-hero-art', 'home-art-depth', 1000],
  ['.home-platform-caption', 'home-platform-caption-in', 900],
  ['.home-platform-name:nth-child(odd)', 'home-platform-left-in', 900],
  ['.home-platform-name:nth-child(even)', 'home-platform-right-in', 900],
  ['.home-about .home-section-heading', 'home-editorial-left-in', 1000],
  ['.home-about-copy', 'home-editorial-right-in', 1000],
  ['.home-services-heading > div', 'home-editorial-left-in', 1000],
  ['.home-services-heading > p', 'home-editorial-right-in', 1000],
  ['.home-tool-stack .bounce-cards__card:nth-child(1) .home-tool-card__content', 'home-card-lift-in', 900],
  ['.home-tool-stack .bounce-cards__card:nth-child(2) .home-tool-card__content', 'home-card-left-in', 950],
  ['.home-tool-stack .bounce-cards__card:nth-child(3) .home-tool-card__content', 'home-card-depth-in', 1000],
  ['.home-tool-stack .bounce-cards__card:nth-child(4) .home-tool-card__content', 'home-card-right-in', 950],
  ['.home-tool-stack .bounce-cards__card:nth-child(5) .home-tool-card__content', 'home-card-lift-in', 900],
  ['.home-faq-intro', 'home-faq-intro-in', 900],
  ['.home-faq-item:nth-child(odd)', 'home-faq-left-in', 850],
  ['.home-faq-item:nth-child(even)', 'home-faq-right-in', 850],
  ['.home-closing-content', 'home-cta-settle-in', 1000],
  ['.home-footer-wordmark', 'home-footer-wordmark-in', 1200],
  ['.home-footer-inner > :nth-child(odd)', 'home-footer-left-in', 900],
  ['.home-footer-inner > :nth-child(even)', 'home-footer-right-in', 900],
  ['.home-footer-bottom', 'home-footer-bottom-in', 900],
];

export default function HomeScrollEffects() {
  useEffect(() => {
    const home = document.querySelector('.home-page');
    if (!home) return undefined;
    const header = home.querySelector<HTMLElement>('.home-header');
    const navLinks = Array.from(
      home.querySelectorAll<HTMLAnchorElement>('.home-nav a'),
    );
    const homeLink = navLinks.find(link => !link.hash);

    const targets: HTMLElement[] = [];

    motionGroups.forEach(([selector, animationName, duration]) => {
      home.querySelectorAll(selector).forEach(element => {
        const target = element as HTMLElement;
        target.style.setProperty('--home-scroll-animation', animationName);
        target.style.setProperty('--home-scroll-duration', `${duration}ms`);
        target.setAttribute('data-home-scroll-effect', '');
        targets.push(target);
      });
    });

    const revealVisibleTargets = () => {
      const viewportHeight = window.innerHeight;
      const visibleTargets: HTMLElement[] = [];
      targets.forEach(target => {
        if (target.classList.contains('home-scroll-entered')) return;
        const bounds = target.getBoundingClientRect();
        if (bounds.top < viewportHeight * 0.9 && bounds.bottom > 0) {
          visibleTargets.push(target);
        }
      });
      visibleTargets.forEach(target => target.classList.add('home-scroll-entered'));
    };

    window.addEventListener('scroll', revealVisibleTargets, { passive: true });
    window.addEventListener('resize', revealVisibleTargets);
    revealVisibleTargets();

    const updateHeaderState = () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();

    const updateActiveNavLink = () => {
      let activeLink = homeLink;
      const activeThreshold = (header?.getBoundingClientRect().bottom ?? 0) + 80;

      navLinks.forEach(link => {
        if (!link.hash) return;
        const section = document.getElementById(link.hash.slice(1));
        if (section && section.getBoundingClientRect().top <= activeThreshold) {
          activeLink = link;
        }
      });

      navLinks.forEach(link => {
        const isActive = link === activeLink;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', link.hash ? 'location' : 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    window.addEventListener('resize', updateActiveNavLink);
    updateActiveNavLink();

    const parallaxTargets = Array.from(
      home.querySelectorAll<HTMLElement>('[data-home-parallax]'),
    );
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let parallaxFrame = 0;
    const updateParallax = () => {
      if (reducedMotion || parallaxFrame) return;

      parallaxFrame = window.requestAnimationFrame(() => {
        parallaxFrame = 0;
        const viewportCenter = window.innerHeight / 2;
        parallaxTargets.forEach(target => {
          const bounds = target.getBoundingClientRect();
          const speed = Number(target.dataset.homeParallax);
          const offset = Math.max(
            -42,
            Math.min(42, (viewportCenter - (bounds.top + bounds.height / 2)) * speed),
          );
          target.style.setProperty('--home-parallax-y', `${offset.toFixed(1)}px`);
        });
      });
    };

    if (!reducedMotion && parallaxTargets.length > 0) {
      window.addEventListener('scroll', updateParallax, { passive: true });
      window.addEventListener('resize', updateParallax);
      updateParallax();
    }

    return () => {
      window.removeEventListener('scroll', revealVisibleTargets);
      window.removeEventListener('resize', revealVisibleTargets);
      window.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('scroll', updateActiveNavLink);
      window.removeEventListener('resize', updateActiveNavLink);
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
      if (parallaxFrame) window.cancelAnimationFrame(parallaxFrame);
      parallaxTargets.forEach(target => target.style.removeProperty('--home-parallax-y'));
    };
  }, []);

  return null;
}