'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FaHeart as Heart,
    FaBookOpen as BookOpen,
    FaGamepad as Gamepad2,
    FaBook as Library,
    FaLeaf as Leaf,
    FaGear as Settings,
    FaGaugeHigh as DashboardIcon,
} from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BrandLogo from '@/components/BrandLogo';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { href: '/games', label: 'Activities', Icon: Gamepad2 },
    { href: '/resources', label: 'Resources', Icon: Library },
    { href: '/journal', label: 'Journal', Icon: BookOpen },
    { href: '/mood', label: 'Mood', Icon: Heart },
    { href: '/mind-garden', label: 'Mind Garden', Icon: Leaf },
    { href: '/profile', label: 'Profile', Icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuToggleRef = useRef<HTMLButtonElement>(null);
    const menuPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        menuPanelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                menuToggleRef.current?.focus();
            }
        };

        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('keydown', closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [menuOpen]);

    const prefetchRoute = (href: string) => router.prefetch(href);

    return (
        <nav className="member-navbar sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="member-navbar-inner max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" aria-label="Safe Haven dashboard" className="member-brand">
                        <BrandLogo className="h-[55px] w-[138px] sm:h-[66px] sm:w-[165px]" />
                    </Link>
                    <button
                        ref={menuToggleRef}
                        className={`member-menu-toggle xl:hidden${menuOpen ? ' is-open' : ''}`}
                        type="button"
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        aria-controls="member-mobile-menu"
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        <span className="member-menu-toggle-lines" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </span>
                    </button>
                    <div className="member-nav-links hidden xl:flex items-center space-x-4 md:space-x-6">
                        {navItems.map(({ href, label, Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={pathname === href ? 'page' : undefined}
                                className={`member-nav-link ${pathname === href ? 'is-active' : ''}`}
                                onMouseEnter={() => prefetchRoute(href)}
                                onFocus={() => prefetchRoute(href)}
                                onTouchStart={() => prefetchRoute(href)}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden md:inline">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {menuOpen &&
                createPortal(
                    <div
                        ref={menuPanelRef}
                        id="member-mobile-menu"
                        className="home-mobile-panel member-mobile-panel is-open"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Member navigation"
                        onKeyDown={event => {
                            if (event.key !== 'Tab' || !menuPanelRef.current) return;

                            const focusable = menuPanelRef.current.querySelectorAll<HTMLElement>(
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
                                    setMenuOpen(false);
                                    menuToggleRef.current?.focus();
                                }}
                            >
                                <span />
                                <span />
                            </button>
                        </div>
                        <nav aria-label="Member mobile navigation" className="home-mobile-links member-mobile-links">
                            {navItems.map(({ href, label }, index) => (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={pathname === href ? 'page' : undefined}
                                    onMouseEnter={() => prefetchRoute(href)}
                                    onFocus={() => prefetchRoute(href)}
                                    onTouchStart={() => prefetchRoute(href)}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <span>{label}</span>
                                    <span className="home-mobile-link-number" aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>,
                    document.body,
                )}
        </nav>
    );
}
