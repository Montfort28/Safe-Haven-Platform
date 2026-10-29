'use client';

import { useEffect, useRef, useState } from 'react';
import { FaInstagram as Instagram } from 'react-icons/fa6';
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

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
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

      <div
        id="home-mobile-menu"
        className={`home-mobile-panel${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
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
      </div>
    </div>
  );
}
