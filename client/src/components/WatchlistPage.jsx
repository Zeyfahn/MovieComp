import React, { useState } from 'react';
import { Bookmark, Swords, Trash2, Search, Film, Sparkles, ExternalLink } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useDuel } from '../context/DuelContext';
import { useNavigate } from 'react-router-dom';
import { MOODS_LIST } from './MoodChips';

export function WatchlistPage({ onOpenDetails }) {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { quickDuel } = useDuel();

  const [filterMood, setFilterMood] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = watchlist.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.title?.toLowerCase().includes(search.toLowerCase());

    const matchesMood =
      !filterMood ||
      (item.primary_mood && item.primary_mood.moodId === filterMood);

    return matchesSearch && matchesMood;
  });

  const handleStartDuel = (movie) => {
    quickDuel(movie);
    navigate('/duel');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            Personal Library
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Your Watchlist
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Films you've saved to watch later. Filter by mood or launch them directly into Movie Comp.
          </p>
        </div>

        {/* Filter / Search within Watchlist */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter your saved films..."
              className="bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Mood Filters */}
      {watchlist.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            onClick={() => setFilterMood(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              !filterMood
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Saved ({watchlist.length})
          </button>
          {MOODS_LIST.map((m) => {
            const count = watchlist.filter(
              (i) => i.primary_mood && i.primary_mood.moodId === m.id
            ).length;
            if (count === 0) return null;

            return (
              <button
                key={m.id}
                onClick={() => setFilterMood(filterMood === m.id ? null : m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  filterMood === m.id
                    ? 'text-white border-transparent'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-white/5'
                }`}
                style={{
                  backgroundColor: filterMood === m.id ? m.color : undefined,
                }}
              >
                {m.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Watchlist Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((movie) => {
            const poster =
              movie.poster_url ||
              (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

            return (
              <div
                key={movie.movieId || movie.id}
                className="group relative rounded-2xl glass-panel overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all flex flex-col"
              >
                <div
                  className="aspect-[2/3] w-full overflow-hidden bg-slate-900 cursor-pointer relative"
                  onClick={() => onOpenDetails && onOpenDetails(movie)}
                >
                  <img
                    src={poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(movie.movieId || movie.id);
                    }}
                    title="Remove from watchlist"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors border border-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h4
                      onClick={() => onOpenDetails && onOpenDetails(movie)}
                      className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-1 hover:text-rose-400 cursor-pointer"
                      title={movie.title}
                    >
                      {movie.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {movie.release_date?.substring(0, 4) || '—'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartDuel(movie)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Swords className="w-3 h-3" />
                    <span>Duel This</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-white mb-1">
            Your Watchlist is Empty
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Explore films by mood or run Movie Comps, then tap the bookmark icon on any film to save it here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/25 transition-all"
          >
            Explore Movies
          </button>
        </div>
      )}
    </div>
  );
}
