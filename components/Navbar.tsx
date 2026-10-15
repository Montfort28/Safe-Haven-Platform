import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Heart, BookOpen, Gamepad2, Library, Leaf, Settings, LayoutGrid, Menu
} from 'lucide-react';
import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
    { href: '/games', label: 'Games', Icon: Gamepad2 },
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

    const prefetchRoute = (href: string) => router.prefetch(href);

    return (
        <nav className="member-navbar sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <BrandLogo className="h-[52px] w-[140px]" />
                    {/* Hamburger menu for all devices except desktop */}
                    <button className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={() => setMenuOpen(!menuOpen)}>
                        <Menu className="w-7 h-7 text-blue-900" />
                    </button>
                    {/* Full nav links for desktop only */}
                    <div className="member-nav-links hidden lg:flex items-center space-x-4 md:space-x-6">
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
                {/* Mobile/tablet menu: hamburger only for <lg screens */}
                {menuOpen && (
                    <div className="member-mobile-nav lg:hidden mt-2 flex flex-col space-y-2">
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
                                {label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
