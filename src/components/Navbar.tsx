import React, { useState } from 'react';
import { LayoutDashboard, Target, TrendingUp, LogOut, Sparkles, User, Menu, X } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { isLoggedIn, userName, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/practice', label: 'Practice', icon: Target, activeMatch: ['/practice', '/setup', '/interview'] },
    { to: '/progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:scale-105 transition-all">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">PrepAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        {isLoggedIn && currentPath !== '/' && currentPath !== '/login' && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.activeMatch 
                ? link.activeMatch.includes(currentPath)
                : currentPath === link.to;

              return (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isLoggedIn ? (
            currentPath !== '/login' && (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                Sign In
              </Link>
            )
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-700 border-l border-slate-200 pl-4">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {userName ? userName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[130px] truncate">{userName || 'Guest'}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" /> 
                <span>Logout</span>
              </button>

              {/* Mobile hamburger button */}
              {currentPath !== '/' && currentPath !== '/login' && (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isLoggedIn && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Logged in as {userName || 'Guest'}
          </div>
          {navLinks.map((link) => {
            const isActive = link.activeMatch 
              ? link.activeMatch.includes(currentPath)
              : currentPath === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
