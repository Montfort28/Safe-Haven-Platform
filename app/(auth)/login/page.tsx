'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Heart, Brain, Sparkles, Shield, Leaf } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingElement = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
    <div
      className={`absolute ${className} opacity-20 animate-pulse`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: '4s'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-300 via-purple-300 to-teal-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement className="top-20 left-10" delay={0}>
          <Heart className="w-8 h-8 text-pink-300" />
        </FloatingElement>
        <FloatingElement className="top-40 right-20" delay={1}>
          <Brain className="w-10 h-10 text-purple-300" />
        </FloatingElement>
        <FloatingElement className="bottom-40 left-20" delay={2}>
          <Sparkles className="w-6 h-6 text-indigo-300" />
        </FloatingElement>
        <FloatingElement className="bottom-20 right-10" delay={3}>
          <Leaf className="w-9 h-9 text-teal-300" />
        </FloatingElement>
        <FloatingElement className="top-1/2 left-1/4" delay={1.5}>
          <Shield className="w-7 h-7 text-blue-300" />
        </FloatingElement>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
            {/* Header */}
            <div className="text-center mb-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome
              </h1>
              <p className="text-gray-600 font-medium">
                Continue your journey to mental wellness
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 pr-14 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-purple-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <Heart className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-medium">
                New to our community?{' '}
                <button className="text-purple-600 hover:text-purple-700 font-bold hover:underline transition-all">
                  Join us today
                </button>
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Trusted</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Leaf className="w-4 h-4" />
                  <span>Healing</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className={`mt-6 text-center transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="text-gray-600 italic font-medium">
              "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity."
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}