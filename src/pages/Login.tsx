import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthError } from '../services/authClient';

type AuthMode = 'login' | 'register' | 'guest';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login, register, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guestName, setGuestName] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field touch tracking for validation feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loginEmailId = useId();
  const loginPasswordId = useId();
  const registerNameId = useId();
  const registerEmailId = useId();
  const registerPasswordId = useId();
  const registerConfirmPasswordId = useId();
  const guestNameId = useId();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  // Reset errors when switching modes
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setServerError(null);
    setTouched({});
  };

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation checks
  const isEmailValid = (em: string): boolean => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
      em.trim()
    );
  };

  const passwordLengthValid = password.length >= 8;
  const passwordHasLetter = /[A-Za-z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);
  const isPasswordStrong = passwordLengthValid && passwordHasLetter && passwordHasNumber;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  // Password strength score (0 to 4)
  const calculatePasswordStrength = (): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 0.5;
    if (/[^A-Za-z0-9]/.test(password)) score += 0.5;
    return Math.min(4, Math.floor(score));
  };

  const strengthScore = calculatePasswordStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'];

  // Handle Sign In submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !isEmailValid(cleanEmail)) {
      setServerError('Please enter a valid email address.');
      markTouched('email');
      return;
    }

    if (!password) {
      setServerError('Please enter your password.');
      markTouched('password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(cleanEmail, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err instanceof AuthError
          ? err.message
          : err?.message || 'Login failed. Please check your credentials and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setServerError('Please enter your full name (minimum 2 characters).');
      markTouched('name');
      return;
    }

    if (!cleanEmail || !isEmailValid(cleanEmail)) {
      setServerError('Please enter a valid email address.');
      markTouched('email');
      return;
    }

    if (!isPasswordStrong) {
      setServerError('Password must be at least 8 characters and include both letters and numbers.');
      markTouched('password');
      return;
    }

    if (password !== confirmPassword) {
      setServerError('Passwords do not match. Please re-enter your password.');
      markTouched('confirmPassword');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(cleanName, cleanEmail, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err instanceof AuthError
          ? err.message
          : err?.message || 'Registration failed. Please check your details and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Guest submission
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuest = guestName.trim() || 'Candidate';
    loginAsGuest(cleanGuest);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white flex-col md:flex-row">
      {/* Left Side - Brand Showcase */}
      <div className="hidden md:flex md:w-1/2 p-12 bg-slate-900 relative overflow-hidden flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-950"></div>

        {/* Ambient AI Glow Shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">PrepAI</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Production Ready AI Interviews
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Master Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Technical Interview</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed font-light mb-8">
              Interactive technical simulations, real-time AI evaluations, and personalized feedback tailored to your discipline.
            </p>

            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Secure account authentication with isolated user history</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Contextual follow-up questioning powered by Google Gemini</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Strict rubrics evaluating technical depth, clarity & confidence</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted token sessions • No credentials stored in client bundles</span>
        </div>
      </div>

      {/* Right Side - Interactive Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-12 relative overflow-y-auto">
        <div className="md:hidden absolute inset-0 bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white -z-10"></div>

        <div className="w-full max-w-md relative py-6">
          {/* Mobile Header Brand */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">PrepAI</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6" role="tablist" aria-label="Authentication modes">
            <button
              id="tab-sign-in"
              role="tab"
              aria-selected={mode === 'login'}
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-create-account"
              role="tab"
              aria-selected={mode === 'register'}
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
            <button
              id="tab-guest-mode"
              role="tab"
              aria-selected={mode === 'guest'}
              type="button"
              onClick={() => handleModeChange('guest')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'guest'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guest Mode
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1.5">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'guest' && 'Try in Guest Mode'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'login' && 'Sign in to access your interview dashboard and history.'}
              {mode === 'register' && 'Set up your credentials to save progress across devices.'}
              {mode === 'guest' && 'Start practicing immediately without email or password.'}
            </p>
          </div>

          {/* Server / Validation Error Alert Banner */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{serverError}</div>
              <button
                type="button"
                onClick={() => setServerError(null)}
                className="text-red-400 hover:text-red-700 p-0.5"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Content by Mode */}
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label htmlFor={loginEmailId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={loginEmailId}
                      type="email"
                      autoComplete="email"
                      required
                      autoFocus
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm ${
                        touched.email && email && !isEmailValid(email)
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {touched.email && email && !isEmailValid(email) && (
                    <p className="text-xs text-red-600 mt-1">Please enter a valid email address.</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={loginPasswordId} className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={loginPasswordId}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('password')}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !password}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 group mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label htmlFor={registerNameId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id={registerNameId}
                      type="text"
                      autoComplete="name"
                      required
                      autoFocus
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('name')}
                      placeholder="e.g. Alex Morgan"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm ${
                        touched.name && name.trim().length > 0 && name.trim().length < 2
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {touched.name && name.trim().length > 0 && name.trim().length < 2 && (
                    <p className="text-xs text-red-600 mt-1">Name must be at least 2 characters.</p>
                  )}
                </div>

                <div>
                  <label htmlFor={registerEmailId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={registerEmailId}
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('email')}
                      placeholder="alex@example.com"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm ${
                        touched.email && email && !isEmailValid(email)
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {touched.email && email && !isEmailValid(email) && (
                    <p className="text-xs text-red-600 mt-1">Please enter a valid email address.</p>
                  )}
                </div>

                <div>
                  <label htmlFor={registerPasswordId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={registerPasswordId}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('password')}
                      placeholder="At least 8 characters"
                      className="block w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Visual Meter */}
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Password strength:</span>
                        <span className="font-semibold text-slate-700">
                          {strengthLabels[strengthScore - 1] || 'Too weak'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map(idx => (
                          <div
                            key={idx}
                            className={`rounded-full transition-all ${
                              idx <= strengthScore ? strengthColors[strengthScore - 1] : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-1 pt-1 text-xs text-slate-500">
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordLengthValid ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {passwordLengthValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordHasLetter && passwordHasNumber ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {passwordHasLetter && passwordHasNumber ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          <span>Letters & numbers</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor={registerConfirmPasswordId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      id={registerConfirmPasswordId}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value);
                        if (serverError) setServerError(null);
                      }}
                      onBlur={() => markTouched('confirmPassword')}
                      placeholder="Repeat your password"
                      className={`block w-full pl-10 pr-11 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm ${
                        touched.confirmPassword && confirmPassword && !doPasswordsMatch
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && confirmPassword && !doPasswordsMatch && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                  )}
                </div>

                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    !email.trim() ||
                    !isPasswordStrong ||
                    password !== confirmPassword
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 group mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {mode === 'guest' && (
              <motion.form
                key="guest-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleGuestSubmit}
                className="space-y-4"
              >
                <div>
                  <label htmlFor={guestNameId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Candidate Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id={guestNameId}
                      type="text"
                      required
                      autoFocus
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                  <span className="font-semibold block mb-0.5">Guest Mode Notice</span>
                  Guest sessions are stored locally in your current browser. Register an account anytime to preserve interview evaluations permanently.
                </div>

                <button
                  id="btn-guest-submit"
                  type="submit"
                  disabled={!guestName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 group mt-2"
                >
                  <span>Start Practice as Guest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
