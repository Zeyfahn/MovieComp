import React, { useState } from 'react';
import { Swords, Bookmark, Star, Info, HelpCircle } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useDuel } from '../context/DuelContext';

export function MovieCard({ movie, onOpenDetails }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { quickDuel, slot1, slot2 } = useDuel();
  const [activeTooltip, setActiveTooltip] = useState(null);

  if (!movie) return null;

  const isSaved = isInWatchlist(movie.id);
  const isInDuel =
    (slot1 && String(slot1.id) === String(movie.id)) ||
    (slot2 && String(slot2.id) === String(movie.id));

  const year = movie.release_date ? movie.release_date.substring(0, 4) : '—';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '—';
  const posterUrl =
    movie.poster_url ||
    (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="group relative rounded-2xl glass-panel overflow-hidden border border-white/5 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300 flex flex-col h-full">
      {/* Poster Media Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenDetails && onOpenDetails(movie)}>
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* TMDB Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Quick Duel Badge if Selected */}
          {isInDuel && (
            <div className="px-2 py-1 rounded-lg bg-rose-500 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md shadow-rose-500/40">
              <Swords className="w-3 h-3" />
              <span>In Duel</span>
            </div>
          )}
        </div>

        {/* Floating Quick Action Buttons on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(movie);
            }}
            title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-950/80 border-white/10 text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              quickDuel(movie);
            }}
            title="Add to Movie Comp"
            className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 hover:bg-slate-900 transition-all"
          >
            <Swords className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{year}</span>
            {movie.runtime && <span>{movie.runtime} min</span>}
          </div>

          <h4
            onClick={() => onOpenDetails && onOpenDetails(movie)}
            className="font-bold text-sm text-slate-100 hover:text-rose-400 cursor-pointer line-clamp-1 transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h4>
        </div>

        {/* Explainable Mood Tags (PRD FR-04) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-auto">
          {movie.moods && movie.moods.length > 0 ? (
            movie.moods.slice(0, 2).map((m, idx) => (
              <div key={idx} className="relative">
                <span
                  onMouseEnter={() => setActiveTooltip(idx)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium cursor-help transition-all"
                  style={{
                    backgroundColor: m.available ? `${m.color}20` : 'rgba(107, 114, 128, 0.2)',
                    color: m.available ? m.color : '#9CA3AF',
                    border: `1px solid ${m.available ? `${m.color}40` : 'rgba(107, 114, 128, 0.3)'}`,
                  }}
                >
                  <span>{m.mood}</span>
                  <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                </span>

                {/* Explainability Tooltip */}
                {activeTooltip === idx && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 rounded-lg bg-slate-900 text-slate-200 text-[10px] leading-tight shadow-xl border border-white/15 z-50 pointer-events-none">
                    <div className="font-semibold text-rose-400 mb-0.5">Why this mood?</div>
                    <div>{m.reason}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 italic">Mood match unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
