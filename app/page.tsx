'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Brain, Sparkles, Shield, Users, Zap, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-teal-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-400 bg-clip-text text-transparent">
            Safe Haven
          </h1>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 text-purple-900/80 hover:text-purple-900 border border-purple-200 rounded-xl hover:border-purple-400 transition-all duration-300 backdrop-blur-sm"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div
          className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-900/80 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Professional Mental Health Support</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-purple-900">Reclaim Your</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Inner Peace
              </span>
            </h1>

            <p className="text-xl text-purple-900/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              An evidence-based digital sanctuary designed for adults navigating depression, anxiety, and life's challenges.
              Build resilience, track progress, and find your path to wellness with professional-grade tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 transform hover:-translate-y-1"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 inline transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 text-purple-900 border-2 border-purple-200 rounded-xl text-lg font-semibold hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 backdrop-blur-sm"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
            <div className="bg-purple-100/60 backdrop-blur-sm border border-purple-200 rounded-2xl p-6">
              <div className="text-2xl font-bold text-purple-900 mb-2">New & Growing</div>
              <div className="text-purple-900/60">Join Our Early Community</div>
            </div>
            <div className="bg-pink-100/60 backdrop-blur-sm border border-pink-200 rounded-2xl p-6">
              <div className="text-2xl font-bold text-purple-900 mb-2">Progress-Focused</div>
              <div className="text-purple-900/60">Your Mental Wellness Partner</div>
            </div>
            <div className="bg-teal-100/60 backdrop-blur-sm border border-teal-200 rounded-2xl p-6">
              <div className="text-2xl font-bold text-purple-900 mb-2">24/7</div>
              <div className="text-purple-900/60">Available Anytime</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="group bg-purple-100/60 backdrop-blur-sm border border-purple-200 rounded-2xl p-8 hover:bg-purple-200/80 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Mood Intelligence</h3>
            <p className="text-purple-900/70 leading-relaxed">
              Advanced mood tracking with AI-powered insights. Understand patterns, triggers, and progress through sophisticated analytics designed by mental health professionals.
            </p>
          </div>

          <div className="group bg-pink-100/60 backdrop-blur-sm border border-pink-200 rounded-2xl p-8 hover:bg-pink-200/80 transition-all duration-500 hover:-translate-y-2 delay-100">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Therapeutic Journaling</h3>
            <p className="text-purple-900/70 leading-relaxed">
              Structured journaling with cognitive behavioral therapy techniques. Process emotions, identify thought patterns, and build healthy coping strategies.
            </p>
          </div>

          <div className="group bg-teal-100/60 backdrop-blur-sm border border-teal-200 rounded-2xl p-8 hover:bg-teal-200/80 transition-all duration-500 hover:-translate-y-2 delay-200">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Crisis Support</h3>
            <p className="text-purple-900/70 leading-relaxed">
              Immediate access to coping tools, crisis resources, and professional support when you need it most. Your safety and well-being are our priority.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-32">
          <div className="bg-gradient-to-r from-purple-200/40 to-pink-200/40 backdrop-blur-sm border border-pink-200 rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-purple-900 mb-6">Ready to Begin Healing?</h2>
            <p className="text-xl text-purple-900/70 mb-8 max-w-2xl mx-auto">
              Join thousands who have found their path to wellness. Start with a free assessment and discover personalized tools for your journey.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 transform hover:-translate-y-1"
            >
              <Users className="w-5 h-5" />
              Join Safe Haven Today
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-purple-900/30" />
      </div>
    </div>
  );
}