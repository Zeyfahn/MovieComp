import React from 'react';
import { Swords, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#07090D] py-12 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white">Movie<span className="text-rose-500">Duel</span></span>
              <p className="text-[11px] text-slate-400">Mood-Based Movie Discovery & Comparison</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Discovery</Link>
            <Link to="/duel" className="hover:text-white transition-colors">Duel Arena</Link>
            <Link to="/recommendations" className="hover:text-white transition-colors">Recommendations</Link>
            <Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
          </div>
        </div>

        {/* Attribution & Notice (PRD Section 12) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
            This product uses the TMDB API but is not endorsed or certified by TMDB. Film artwork and metadata are supplied by The Movie Database.
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            Built for End-Term Software Project by <strong className="text-slate-200">Mohammed Zohaib</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
