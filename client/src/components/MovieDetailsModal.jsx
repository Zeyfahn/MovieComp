import React from 'react';
import { X, Star, Clock, Calendar, Swords, Bookmark, Sparkles, AlertCircle } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useDuel } from '../context/DuelContext';
import { useNavigate } from 'react-router-dom';

export function MovieDetailsModal({ movie, onClose }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { quickDuel } = useDuel();

  if (!movie) return null;

  const isSaved = isInWatchlist(movie.id);
  const posterUrl =
    movie.poster_url ||
    (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUrl;

  const handleStartDuel = () => {
    quickDuel(movie);
    onClose();
    navigate('/duel');
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 my-8">
        {/* Backdrop Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-40 filter saturate-150"
            onError={(e) => {
              e.target.src = posterUrl;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11141E] via-[#11141E]/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8 sm:pb-8 -mt-24 sm:-mt-32">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster Card */}
            <div className="w-36 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex-shrink-0 bg-slate-900">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h2>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 mt-2 mb-4">
                {movie.release_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {movie.release_date}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {movie.runtime} min
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {Number(movie.vote_average || 7).toFixed(1)} / 10
                  {movie.vote_count && (
                    <span className="text-slate-500 font-normal text-xs">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </span>
              </div>

              {/* Genres list */}
              {movie.genre_names && movie.genre_names.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {movie.genre_names.map((g, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleStartDuel}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all"
                >
                  <Swords className="w-4 h-4" />
                  Compare in Duel
                </button>

                <button
                  onClick={() => toggleWatchlist(movie)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all flex items-center gap-2 ${
                    isSaved
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-slate-800 text-slate-200 border-white/10 hover:border-white/20 hover:bg-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-rose-400' : ''}`} />
                  {isSaved ? 'Saved in Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="mt-6">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
              Synopsis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {movie.overview || 'No synopsis provided for this title.'}
            </p>
          </div>

          {/* Explainable Derived Moods Breakdown (PRD Section 4 & FR-04) */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-200">
                Rule-Based Mood Heuristics
              </h3>
            </div>

            {movie.moods && movie.moods.length > 0 ? (
              <div className="space-y-2">
                {movie.moods.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl flex items-start gap-3 border text-xs"
                    style={{
                      backgroundColor: m.available ? `${m.color}10` : 'rgba(107, 114, 128, 0.1)',
                      borderColor: m.available ? `${m.color}30` : 'rgba(107, 114, 128, 0.2)',
                    }}
                  >
                    <span
                      className="px-2 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider flex-shrink-0"
                      style={{
                        backgroundColor: m.available ? `${m.color}20` : '#374151',
                        color: m.available ? m.color : '#9CA3AF',
                      }}
                    >
                      {m.mood}
                    </span>
                    <span className="text-slate-300 flex-1">{m.reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Mood match unavailable: movie lacks standard TMDB genre metadata.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
