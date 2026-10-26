import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Film,
  Swords,
  Bookmark,
  Sparkles,
  Search,
  User as UserIcon,
  Sliders,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { api } from '../services/api';

export function Navbar({ onSelectMovie }) {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal, openPreferences } = useAuth();
  const { watchlist } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchMovies(searchQuery);
        if (res.success) {
          setSearchResults(res.movies || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { to: '/', label: 'Discovery', icon: Compass },
    { to: '/duel', label: 'Movie Comp', icon: Swords },
    { to: '/recommendations', label: 'For You', icon: Sparkles },
    {
      to: '/watchlist',
      label: 'Watchlist',
      icon: Bookmark,
      badge: watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-300">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Movie<span className="text-rose-500">Comp</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Mood Engine
            </span>
          </div>
        </Link>

        {/* Global Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Search films by title, genre, keyword..."
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-dropdown rounded-2xl overflow-hidden border border-white/10 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-slate-400">
                  <div className="inline-block w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching films...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2 divide-y divide-white/5">
                  {searchResults.slice(0, 6).map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => {
                        setShowDropdown(false);
                        if (onSelectMovie) onSelectMovie(movie);
                      }}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <img
                        src={movie.poster_url || 'https://via.placeholder.com/45x65?text=No+Poster'}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0 bg-slate-800"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/45x65?text=No+Poster';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-100 truncate">
                          {movie.title}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{movie.release_date?.substring(0, 4) || 'Unknown year'}</span>
                          <span>•</span>
                          <span className="text-amber-400">★ {Number(movie.vote_average || 7).toFixed(1)}</span>
                          {movie.primary_mood && (
                            <>
                              <span>•</span>
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px]"
                                style={{
                                  backgroundColor: `${movie.primary_mood.color}20`,
                                  color: movie.primary_mood.color,
                                }}
                              >
                                {movie.primary_mood.mood}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">
                  No movies found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{link.label}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Auth & Preferences */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden md:inline max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass-dropdown rounded-2xl py-2 border border-white/10 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openPreferences();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Mood & Taste Preferences
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
