import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { TrendingUp, LayoutDashboard, Compass, Briefcase, Bookmark, Bot, User as UserIcon, Shield, LogOut, Globe } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { country, setCountry } = useCountry();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
              AlphaAdvisor
            </span>
            <span className="block text-[10px] text-blue-600 font-semibold tracking-widest uppercase">
              AI Virtual Portfolio
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/explore') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              <Compass className="w-4 h-4" /> Stock Explorer
            </Link>
            <Link
              to="/portfolio"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/portfolio') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              <Briefcase className="w-4 h-4" /> Portfolio
            </Link>
            <Link
              to="/watchlist"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/watchlist') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              <Bookmark className="w-4 h-4" /> Watchlist
            </Link>
            <Link
              to="/ai-chat"
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/ai-chat') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              <Bot className="w-4 h-4" /> AI Advisor
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isActive('/admin') ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                  }`}
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
          </nav>
        )}

        {/* Right Section: Country Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Country Market Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setCountry('US')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${country === 'US' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              🇺🇸 US
            </button>
            <button
              onClick={() => setCountry('IN')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${country === 'IN' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              🇮🇳 IN (NSE)
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <span className="block text-xs font-medium text-slate-900">{user.full_name}</span>
                <span className="block text-[10px] text-blue-600 font-mono">
                  {country === 'IN' ? formatCurrency(user.virtual_balance_inr, 'INR') : formatCurrency(user.virtual_balance_usd, 'USD')}
                </span>
              </div>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:border-blue-500 transition-colors text-blue-700 font-bold text-sm"
              >
                {user.full_name.charAt(0).toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
              {/* Theme toggle button */}
              {/* <button
                onClick={toggleTheme}
                classNam/e="hidden p-2 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                className="hidden"
                title="Toggle Them/e"
              >
                {theme === 'dark' ?  className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {null}
              </button> */}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all">
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
