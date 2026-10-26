import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, Star, Bookmark, Swords, Info } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useDuel } from '../context/DuelContext';
import { useNavigate } from 'react-router-dom';

export function RecommendationsSection({ onOpenDetails }) {
  const navigate = useNavigate();
  const { user, openPreferences } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { quickDuel } = useDuel();

  const [recommendations, setRecommendations] = useState([]);
  const [preferencesUsed, setPreferencesUsed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      setLoading(true);
      try {
        const params = {};
        if (user && user.preferences) {
          if (user.preferences.moods) params.moods = user.preferences.moods;
          if (user.preferences.favoriteGenres) params.genres = user.preferences.favoriteGenres;
          if (user.preferences.targetRuntime) params.runtime = user.preferences.targetRuntime;
        }

        const res = await api.getRecommendations(params);
        if (res.success && res.recommendations) {
          setRecommendations(res.recommendations);
          setPreferencesUsed(res.preferencesUsed);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecs();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Preferences Bar */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Explainable Recommendations
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curated For Your Tastes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Deterministic rule-based ranking based on your chosen moods and genres. Every film includes a transparent reason for why it was recommended.
          </p>

          {/* Active preferences tags */}
          {preferencesUsed && (
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
              <span className="text-slate-400 font-semibold">Active Criteria:</span>
              {preferencesUsed.moods && preferencesUsed.moods.length > 0 ? (
                preferencesUsed.moods.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium capitalize"
                  >
                    Mood: {m}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No preferred mood set</span>
              )}

              {preferencesUsed.favoriteGenres && preferencesUsed.favoriteGenres.length > 0 && (
                preferencesUsed.favoriteGenres.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-medium"
                  >
                    {g}
                  </span>
                ))
              )}

              {preferencesUsed.targetRuntime && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  ~{preferencesUsed.targetRuntime}m
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={openPreferences}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-white/10 flex-shrink-0"
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Customize Preferences</span>
        </button>
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <div>Analyzing films against your taste profile...</div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((movie) => {
            const isSaved = isInWatchlist(movie.id);
            const poster =
              movie.poster_url ||
              (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

            return (
              <div
                key={movie.id}
                className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={poster}
                    alt={movie.title}
                    onClick={() => onOpenDetails && onOpenDetails(movie)}
                    className="w-24 aspect-[2/3] object-cover rounded-xl bg-slate-900 cursor-pointer group-hover:scale-105 transition-transform flex-shrink-0 shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{movie.release_date?.substring(0, 4) || '—'}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {Number(movie.vote_average || 7).toFixed(1)}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenDetails && onOpenDetails(movie)}
                      className="font-bold text-base text-white hover:text-indigo-400 cursor-pointer line-clamp-1 mt-0.5"
                      title={movie.title}
                    >
                      {movie.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {movie.overview}
                    </p>

                    {/* Derived Mood Pill */}
                    {movie.primary_mood && (
                      <span
                        className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${movie.primary_mood.color}20`,
                          color: movie.primary_mood.color,
                        }}
                      >
                        {movie.primary_mood.mood}
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendation Reason Box (PRD Section 3 & FR-08) */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-white/5 text-[11px] text-indigo-300 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 mt-0.5" />
                  <span>{movie.recommendationReason}</span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      quickDuel(movie);
                      navigate('/duel');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Duel</span>
                  </button>

                  <button
                    onClick={() => toggleWatchlist(movie)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-white/10'
                    }`}
                    title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-rose-400' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          No recommendations found for this criteria. Try selecting different moods or genres.
        </div>
      )}
    </div>
  );
}
