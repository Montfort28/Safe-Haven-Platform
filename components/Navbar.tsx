'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    FaHeart as Heart,
    FaBookOpen as BookOpen,
    FaGamepad as Gamepad2,
    FaBook as Library,
    FaLeaf as Leaf,
    FaGear as Settings,
    FaGaugeHigh as DashboardIcon,
    FaRightFromBracket as LogOut,
} from 'react-icons/fa6';
import BrandLogo from '@/components/BrandLogo';
import Dock from '@/components/Dock';
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
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    const handleLogout = () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        router.push('/');
        router.refresh();
    };

    const dockItems = [
        ...navItems.map(({ href, label, Icon }) => ({
            icon: <Icon aria-hidden="true" size="1em" />,
            label,
            active: pathname === href,
            onClick: () => router.push(href),
        })),
        { separator: true },
        {
            icon: <LogOut aria-hidden="true" size="1em" />,
            label: 'Log out',
            onClick: handleLogout,
        },
    ];

    useEffect(() => {
        setPortalRoot(document.body);
    }, []);

    const dock = (
        <aside className="member-dock-shell" aria-label="Safe Haven platform navigation">
            <Link
                href="/dashboard"
                aria-label="Safe Haven dashboard"
                className="member-dock-brand"
            >
                <BrandLogo className="member-dock-mark" />
            </Link>
            <Dock
                items={dockItems}
                position="left"
                theme="dark"
                baseItemSize={46}
                magnification={60}
                distance={170}
                panelHeight={64}
                gap={8}
                roundness={0.55}
                spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
                bounce
                tiles={false}
                showLabels
                showIndicators={false}
                showBadges={false}
                accentColor="#FE7A25"
                className="member-platform-dock"
                style={{
                    '--dock-panel': 'rgba(252, 249, 234, 0.76)',
                    '--dock-panel-edge': 'rgba(6, 71, 52, 0.12)',
                    '--dock-panel-highlight': 'rgba(255, 255, 255, 0.88)',
                    '--dock-panel-shadow': '0 18px 38px -22px rgba(32, 43, 39, 0.22), 0 4px 14px -9px rgba(32, 43, 39, 0.14)',
                    '--dock-tile': 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(252, 249, 234, 0.82) 100%)',
                    '--dock-tile-edge': 'rgba(6, 71, 52, 0.12)',
                    '--dock-tile-highlight': 'rgba(255, 255, 255, 0.9)',
                    '--dock-tile-shadow': '0 3px 9px -6px rgba(32, 43, 39, 0.2)',
                    '--dock-ink': '#064734',
                    '--dock-label': '#FCF9EA',
                    '--dock-label-ink': '#064734',
                    '--dock-dot': '#FE7A25',
                    '--dock-separator': 'rgba(6, 71, 52, 0.16)',
                }}
            />
        </aside>
    );

    return (
        <>
            {portalRoot ? createPortal(dock, portalRoot) : null}

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
        </>
    );
}
