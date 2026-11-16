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
import BrandLogo from '@/components/BrandLogo';
import StaggeredMenu from '@/components/StaggeredMenu';

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

    const prefetchRoute = (href: string) => router.prefetch(href);

    return (
        <nav className="member-navbar sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="member-navbar-inner max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" aria-label="Safe Haven dashboard" className="member-brand">
                        <BrandLogo className="h-[48px] w-[120px] sm:h-[58px] sm:w-[145px]" withName />
                    </Link>
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
                    <div className="home-mobile-nav member-mobile-nav">
                        <StaggeredMenu
                            className="home-staggered-menu"
                            items={navItems.map(({ href, label }) => ({ label, link: href }))}
                            socialItems={[
                                { label: 'Instagram', link: 'https://www.instagram.com/safehaven.circle/' },
                            ]}
                            colors={['#064734', '#FE7A25', '#006732', '#202B27']}
                            menuButtonColor="#064734"
                            openMenuButtonColor="#FE7A25"
                            accentColor="#FE7A25"
                            isFixed
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
