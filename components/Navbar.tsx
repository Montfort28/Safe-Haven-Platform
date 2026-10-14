import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Heart, BookOpen, Gamepad2, Library, Leaf, Settings, LayoutGrid, Menu
} from 'lucide-react';
import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="member-navbar sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <BrandLogo className="h-[60px] w-[162px]" />
                    {/* Hamburger menu for all devices except desktop */}
                    <button className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={() => setMenuOpen(!menuOpen)}>
                        <Menu className="w-7 h-7 text-blue-900" />
                    </button>
                    {/* Full nav links for desktop only */}
                    <div className="member-nav-links hidden lg:flex items-center space-x-4 md:space-x-6">
                        <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined} className={`member-nav-link ${pathname === '/dashboard' ? 'is-active' : ''}`}> <LayoutGrid className="w-5 h-5" /> <span className="hidden md:inline">Dashboard</span> </Link>
                        <Link href="/games" aria-current={pathname === '/games' ? 'page' : undefined} className={`member-nav-link ${pathname === '/games' ? 'is-active' : ''}`}> <Gamepad2 className="w-5 h-5" /> <span className="hidden md:inline">Games</span> </Link>
                        <Link href="/resources" aria-current={pathname === '/resources' ? 'page' : undefined} className={`member-nav-link ${pathname === '/resources' ? 'is-active' : ''}`}> <Library className="w-5 h-5" /> <span className="hidden md:inline">Resources</span> </Link>
                        <Link href="/journal" aria-current={pathname === '/journal' ? 'page' : undefined} className={`member-nav-link ${pathname === '/journal' ? 'is-active' : ''}`}> <BookOpen className="w-5 h-5" /> <span className="hidden md:inline">Journal</span> </Link>
                        <Link href="/mood" aria-current={pathname === '/mood' ? 'page' : undefined} className={`member-nav-link ${pathname === '/mood' ? 'is-active' : ''}`}> <Heart className="w-5 h-5" /> <span className="hidden md:inline">Mood</span> </Link>
                        <Link href="/mind-garden" aria-current={pathname === '/mind-garden' ? 'page' : undefined} className={`member-nav-link ${pathname === '/mind-garden' ? 'is-active' : ''}`}> <Leaf className="w-5 h-5" /> <span className="hidden md:inline">Mind Garden</span> </Link>
                        <Link href="/profile" aria-current={pathname === '/profile' ? 'page' : undefined} className={`member-nav-link ${pathname === '/profile' ? 'is-active' : ''}`}> <Settings className="w-5 h-5" /> <span className="hidden md:inline">Profile</span> </Link>
                    </div>
                </div>
                {/* Mobile/tablet menu: hamburger only for <lg screens */}
                {menuOpen && (
                    <div className="member-mobile-nav lg:hidden mt-2 flex flex-col space-y-2">
                        <Link href="/dashboard" aria-current={pathname === '/dashboard' ? 'page' : undefined} className="member-nav-link"> <LayoutGrid className="w-5 h-5" /> Dashboard </Link>
                        <Link href="/games" aria-current={pathname === '/games' ? 'page' : undefined} className="member-nav-link"> <Gamepad2 className="w-5 h-5" /> Games </Link>
                        <Link href="/resources" aria-current={pathname === '/resources' ? 'page' : undefined} className="member-nav-link"> <Library className="w-5 h-5" /> Resources </Link>
                        <Link href="/journal" aria-current={pathname === '/journal' ? 'page' : undefined} className="member-nav-link"> <BookOpen className="w-5 h-5" /> Journal </Link>
                        <Link href="/mood" aria-current={pathname === '/mood' ? 'page' : undefined} className="member-nav-link"> <Heart className="w-5 h-5" /> Mood </Link>
                        <Link href="/mind-garden" aria-current={pathname === '/mind-garden' ? 'page' : undefined} className="member-nav-link"> <Leaf className="w-5 h-5" /> Mind Garden </Link>
                        <Link href="/profile" aria-current={pathname === '/profile' ? 'page' : undefined} className="member-nav-link"> <Settings className="w-5 h-5" /> Profile </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
