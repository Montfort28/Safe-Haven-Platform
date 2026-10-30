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

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                menuToggleRef.current?.focus();
            }
        };

        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
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
                <div
                    id="member-mobile-menu"
                    className={`member-mobile-nav xl:hidden${menuOpen ? ' is-open' : ''}`}
                    aria-hidden={!menuOpen}
                    inert={!menuOpen}
                >
                    <p className="member-mobile-nav-heading">Find your space</p>
                    <div className="member-mobile-nav-links">
                        {navItems.map(({ href, label, Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={pathname === href ? 'page' : undefined}
                                className={`member-nav-link ${pathname === href ? 'is-active' : ''}`}
                                onMouseEnter={() => prefetchRoute(href)}
                                onFocus={() => prefetchRoute(href)}
                                onTouchStart={() => prefetchRoute(href)}
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
