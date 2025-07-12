'use client';

import { Home, BarChart3, Gamepad2, Library, BookOpen, User, LogOut, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <nav className="glass-card mx-4 mt-4 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">Safe Haven</h1>
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600">
                            <Home className="w-5 h-5" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link href="/games" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <Gamepad2 className="w-5 h-5" />
                            <span className="hidden sm:inline">Games</span>
                        </Link>
                        <Link href="/resources" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <Library className="w-5 h-5" />
                            <span className="hidden sm:inline">Resources</span>
                        </Link>
                        <Link href="/journal" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <BookOpen className="w-5 h-5" />
                            <span className="hidden sm:inline">Journal</span>
                        </Link>
                        <Link href="/mood" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="hidden sm:inline">Mood</span>
                        </Link>
                        <Link href="/mind-garden" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2s-6 3-6 10c0 3.3 2.7 6 6 6s6-2.7 6-6c0-7-6-10-6-10z" />
                            </svg>
                            <span className="hidden sm:inline">Mind Garden</span>
                        </Link>
                        <Link href="/profile" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <button
                            onClick={() => {
                                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    );
}
