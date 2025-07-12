'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Heart, Brain, Sparkles, Shield, Leaf, UserPlus, Smile } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (formData.name && formData.email && formData.password) {
        console.log('Registration successful!');
        // In real app: router.push('/dashboard');
      } else {
        setError('Please fill in all fields');
      }
      setIsLoading(false);
    }, 2000);
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-400';
    if (passwordStrength < 50) return 'bg-orange-400';
    if (passwordStrength < 75) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

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
        <div className={`w-full max-w-lg transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.01]">
            {/* Header */}
            <div className="text-center mb-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Join Safe Haven
              </h1>
              <p className="text-gray-600 font-medium">
                Begin your journey to mental wellness and self-discovery
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600 transition-colors">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 pr-14 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password Strength</span>
                      <span className={`font-medium ${passwordStrength >= 75 ? 'text-green-600' : passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-cyan-600 transition-colors">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-6 py-4 pr-14 border-2 border-white/50 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-800 font-medium transition-all duration-300 hover:bg-white/70"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center space-x-1 text-green-600 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Passwords match</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-red-600 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Passwords don't match</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-cyan-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Create My Account</span>
                    <Smile className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Terms and Privacy */}
              <div className="text-center text-xs text-gray-600">
                By creating an account, you agree to our{' '}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button className="text-cyan-600 hover:text-cyan-700 hover:underline">Privacy Policy</button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-medium">
                Already part of our community?{' '}
                <button className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline transition-all">
                  Sign in here
                </button>
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>Supportive</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Leaf className="w-4 h-4" />
                  <span>Growth</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inspirational Quote */}
          <div className={`mt-6 text-center transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="text-gray-600 italic font-medium">
              "The brave may not live forever, but the cautious do not live at all. Take the first step."
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