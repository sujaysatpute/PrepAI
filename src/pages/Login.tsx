import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsGuest, isLoggedIn } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginAsGuest(name.trim());
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 p-12 bg-slate-900 relative overflow-hidden flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-950"></div>
        
        {/* Abstract AI Shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl mix-blend-screen"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">PrepAI</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Master Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Interview</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed font-light mb-8">
              Practice realistic AI-driven technical interviews, get instant constructive feedback, and track your progress over time.
            </p>

            <div className="space-y-3 text-slate-300 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero sign-up friction: instant guest access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Session history stored safely in your browser</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Tailored questions for Frontend, Backend, Cloud & more</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Private, browser-stored sessions with no tracking</span>
        </div>
      </div>

      {/* Right Side - Guest Mode Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="md:hidden absolute inset-0 bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white -z-10"></div>
        <div className="md:hidden absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10"></div>
        
        <div className="w-full max-w-md relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center md:text-left"
          >
            <div className="md:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">PrepAI</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome to PrepAI</h2>
            <p className="text-slate-500">
              Enter your name to start practicing in Guest Mode. No password required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="guest-name" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                  Your Name or Nickname
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="guest-name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none shadow-sm"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <span className="font-semibold block mb-0.5">Guest Mode Active</span>
                Your interview sessions, performance metrics, and progress are saved directly in your browser's local storage.
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 group mt-4"
              >
                Start Practice as Guest
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
