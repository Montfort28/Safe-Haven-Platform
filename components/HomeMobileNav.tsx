'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaInstagram as Instagram } from 'react-icons/fa6';
import BrandLogo from '@/components/BrandLogo';
import HomeSignInButton from '@/components/HomeSignInButton';

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#faq', label: 'FAQs' },
  { href: '#contact', label: 'Contact' },
];

export default function HomeMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="home-mobile-nav">
      <button
        ref={toggleRef}
        className={`home-menu-toggle${isOpen ? ' is-open' : ''}`}
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="home-mobile-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="home-menu-toggle-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            id="home-mobile-menu"
            className="home-mobile-panel is-open"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            onKeyDown={(event) => {
              if (event.key !== 'Tab' || !panelRef.current) return;

              const focusable = panelRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled])',
              );
              const first = focusable[0];
              const last = focusable[focusable.length - 1];

              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
          >
            <div className="home-mobile-panel-header">
              <BrandLogo className="home-mobile-panel-logo h-[56px] w-[140px]" />
              <button
                className="home-mobile-close"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => {
                  setIsOpen(false);
                  toggleRef.current?.focus();
                }}
              >
                <span />
                <span />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="home-mobile-links">
              {navigationLinks.map((link, index) => (
                <a
                  href={link.href}
                  key={link.label}
                  onClick={() => setIsOpen(false)}
                  data-menu-index={index}
                >
                  <span>{link.label}</span>
                  <span className="home-mobile-link-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                </a>
              ))}
            </nav>

            <div className="home-mobile-panel-actions">
              <a
                className="home-mobile-instagram"
                href="https://www.instagram.com/safehaven.circle/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Safe Haven on Instagram"
              >
                <Instagram aria-hidden="true" size={18} />
                Instagram
              </a>
              <HomeSignInButton />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
