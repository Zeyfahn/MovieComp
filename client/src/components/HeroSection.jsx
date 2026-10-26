import React from 'react';
import { Swords, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection({ onExploreClick }) {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24 border-b border-white/5">
      {/* Ambient background glowing orbs */}
      <div className="ambient-glow w-96 h-96 bg-rose-600/15 -top-20 -left-20" />
      <div className="ambient-glow w-96 h-96 bg-indigo-600/15 top-10 right-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 backdrop-blur-md mb-6 shadow-xl">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Explainable Mood & Comparison Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-slate-400">Zero Black-Box Guesswork</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Find the film that fits your{' '}
          <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-indigo-500 bg-clip-text text-transparent">
            current mood.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explore movies tagged by transparent heuristics over TMDB metadata. Pit any two films against each other in deterministic comparisons with fully explainable scoring.
        </p>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/duel"
            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white shadow-xl shadow-rose-500/25 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>Launch Movie Comp</span>
          </Link>

          <button
            onClick={onExploreClick}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Browse by Mood</span>
          </button>
        </div>

        {/* Core Value Pillars */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left text-xs">
          <div className="p-3.5 rounded-2xl glass-panel border border-white/5">
            <div className="font-bold text-slate-200 mb-0.5">8 Transparent Moods</div>
            <div className="text-slate-400 text-[11px]">Rule-mapped from TMDB genres</div>
          </div>
          <div className="p-3.5 rounded-2xl glass-panel border border-white/5">
            <div className="font-bold text-slate-200 mb-0.5">Deterministic Scoring</div>
            <div className="text-slate-400 text-[11px]">Explainable math, no black-box AI</div>
          </div>
          <div className="p-3.5 rounded-2xl glass-panel border border-white/5">
            <div className="font-bold text-slate-200 mb-0.5">Tie Threshold Handling</div>
            <div className="text-slate-400 text-[11px]">&lt;3 pts declared "Too close to call"</div>
          </div>
          <div className="p-3.5 rounded-2xl glass-panel border border-white/5">
            <div className="font-bold text-slate-200 mb-0.5">Persistent Watchlist</div>
            <div className="text-slate-400 text-[11px]">One item per user, instant sync</div>
          </div>
        </div>
      </div>
    </div>
  );
}
