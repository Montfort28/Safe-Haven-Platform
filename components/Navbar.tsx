import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Heart, BookOpen, Gamepad2, Library, Leaf, Settings, LayoutGrid, Menu
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="bg-gradient-to-br from-blue-100/80 via-indigo-100/80 to-purple-100/80 backdrop-blur-md border-b border-blue-200/40 shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-900 drop-shadow-sm" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>Safe Haven</div>
                    {/* Hamburger menu for all devices except desktop */}
                    <button className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={() => setMenuOpen(!menuOpen)}>
                        <Menu className="w-7 h-7 text-blue-900" />
                    </button>
                    {/* Full nav links for desktop only */}
                    <div className="hidden lg:flex items-center space-x-4 md:space-x-6" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>
                        <Link href="/dashboard" className={`text-slate-700 hover:text-blue-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/dashboard' ? 'border-b-2 border-indigo-500 text-indigo-700' : ''}`}> <LayoutGrid className="w-5 h-5" /> <span className="hidden md:inline">Dashboard</span> </Link>
                        <Link href="/games" className={`text-slate-700 hover:text-violet-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/games' ? 'border-b-2 border-violet-500 text-violet-700' : ''}`}> <Gamepad2 className="w-5 h-5" /> <span className="hidden md:inline">Games</span> </Link>
                        <Link href="/resources" className={`text-slate-700 hover:text-cyan-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/resources' ? 'border-b-2 border-cyan-500 text-cyan-700' : ''}`}> <Library className="w-5 h-5" /> <span className="hidden md:inline">Resources</span> </Link>
                        <Link href="/journal" className={`text-slate-700 hover:text-amber-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/journal' ? 'border-b-2 border-amber-500 text-amber-700' : ''}`}> <BookOpen className="w-5 h-5" /> <span className="hidden md:inline">Journal</span> </Link>
                        <Link href="/mood" className={`text-slate-700 hover:text-pink-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/mood' ? 'border-b-2 border-pink-500 text-pink-700' : ''}`}> <Heart className="w-5 h-5" /> <span className="hidden md:inline">Mood</span> </Link>
                        <Link href="/mind-garden" className={`text-slate-700 hover:text-green-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/mind-garden' ? 'border-b-2 border-green-500 text-green-700' : ''}`}> <Leaf className="w-5 h-5" /> <span className="hidden md:inline">Mind Garden</span> </Link>
                        <Link href="/profile" className={`text-slate-700 hover:text-gray-700 flex items-center gap-2 transition-colors font-medium ${pathname === '/profile' ? 'border-b-2 border-gray-500 text-gray-700' : ''}`}> <Settings className="w-5 h-5" /> <span className="hidden md:inline">Profile</span> </Link>
                    </div>
                </div>
                {/* Mobile/tablet menu: hamburger only for <lg screens */}
                {menuOpen && (
                    <div className="lg:hidden mt-2 flex flex-col space-y-2" style={{ fontFamily: 'Rubik, Arial, sans-serif' }}>
                        <Link href="/dashboard" className={`text-slate-700 hover:text-blue-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/dashboard' ? 'bg-indigo-100 text-indigo-700' : ''}`}> <LayoutGrid className="w-5 h-5" /> Dashboard </Link>
                        <Link href="/games" className={`text-slate-700 hover:text-violet-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/games' ? 'bg-violet-100 text-violet-700' : ''}`}> <Gamepad2 className="w-5 h-5" /> Games </Link>
                        <Link href="/resources" className={`text-slate-700 hover:text-cyan-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/resources' ? 'bg-cyan-100 text-cyan-700' : ''}`}> <Library className="w-5 h-5" /> Resources </Link>
                        <Link href="/journal" className={`text-slate-700 hover:text-amber-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/journal' ? 'bg-amber-100 text-amber-700' : ''}`}> <BookOpen className="w-5 h-5" /> Journal </Link>
                        <Link href="/mood" className={`text-slate-700 hover:text-pink-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/mood' ? 'bg-pink-100 text-pink-700' : ''}`}> <Heart className="w-5 h-5" /> Mood </Link>
                        <Link href="/mind-garden" className={`text-slate-700 hover:text-green-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/mind-garden' ? 'bg-green-100 text-green-700' : ''}`}> <Leaf className="w-5 h-5" /> Mind Garden </Link>
                        <Link href="/profile" className={`text-slate-700 hover:text-gray-700 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium ${pathname === '/profile' ? 'bg-gray-100 text-gray-700' : ''}`}> <Settings className="w-5 h-5" /> Profile </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
