import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Star, Sparkles, Filter, Check } from 'lucide-react';
import { api } from '../services/api';
import { MOODS_LIST } from './MoodChips';

export function MoviePickerModal({ onSelect, onClose, slotNumber, excludeMovieId, targetMood }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onlyTargetMood, setOnlyTargetMood] = useState(false);

  const targetMoodObj = useMemo(() => {
    if (!targetMood) return null;
    return MOODS_LIST.find((m) => m.id === targetMood.toLowerCase());
  }, [targetMood]);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const res = await api.getTrending();
        if (res.success && res.movies) {
          setMovies(res.movies);
        }
      } catch (err) {
        console.error('Failed to load candidate movies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Search effect
  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchMovies(query);
        if (res.success) {
          setMovies(res.movies || []);
        }
      } catch (err) {
        console.error('Search in picker failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Check if a movie matches target mood
  const matchesTargetMood = (movie) => {
    if (!targetMood || !movie.moods) return false;
    return movie.moods.some(
      (m) => m.moodId === targetMood.toLowerCase() && m.available
    );
  };

  // Filter and prioritize candidate movies
  const sortedAndFilteredMovies = useMemo(() => {
    const pool = movies.filter((m) => String(m.id) !== String(excludeMovieId));

    if (!targetMood) {
      return pool;
    }

    if (onlyTargetMood) {
      return pool.filter(matchesTargetMood);
    }

    // Sort matching movies FIRST, followed by the rest
    return [...pool].sort((a, b) => {
      const aMatch = matchesTargetMood(a);
      const bMatch = matchesTargetMood(b);

      if (aMatch && !bMatch) return -1; // a comes first
      if (!aMatch && bMatch) return 1;  // b comes first

      // Secondary tie breaker: rating desc
      const rA = Number(a.vote_average || 0);
      const rB = Number(b.vote_average || 0);
      return rB - rA;
    });
  }, [movies, excludeMovieId, targetMood, onlyTargetMood]);

  const matchingCount = useMemo(() => {
    if (!targetMood) return 0;
    return movies.filter(
      (m) => String(m.id) !== String(excludeMovieId) && matchesTargetMood(m)
    ).length;
  }, [movies, excludeMovieId, targetMood]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span>Select Fighter for Slot {slotNumber}</span>
              {targetMoodObj && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1"
                  style={{
                    backgroundColor: `${targetMoodObj.color}20`,
                    borderColor: `${targetMoodObj.color}40`,
                    color: targetMoodObj.color,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Target: {targetMoodObj.label}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {targetMoodObj ? (
                <span>
                  Showing <strong className="text-slate-200">{targetMoodObj.label}</strong> matching films first in the candidate list.
                </span>
              ) : (
                'Pick from trending films or search any title in TMDB'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-white/5 bg-slate-900/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, overview, or genre..."
              autoFocus
              className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Target Mood Filter Tabs */}
          {targetMoodObj && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOnlyTargetMood(false)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  !onlyTargetMood
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                All Candidates ({movies.filter((m) => String(m.id) !== String(excludeMovieId)).length})
              </button>

              <button
                type="button"
                onClick={() => setOnlyTargetMood(true)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                  onlyTargetMood
                    ? 'text-white shadow-lg'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-white/5'
                }`}
                style={{
                  backgroundColor: onlyTargetMood ? targetMoodObj.color : undefined,
                  borderColor: onlyTargetMood ? targetMoodObj.color : undefined,
                  boxShadow: onlyTargetMood ? `0 0 15px ${targetMoodObj.color}40` : undefined,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Only {targetMoodObj.label} ({matchingCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Movies Candidate List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-white/5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="inline-block w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <div>Loading movie candidates...</div>
            </div>
          ) : sortedAndFilteredMovies.length > 0 ? (
            sortedAndFilteredMovies.map((movie) => {
              const isMoodMatch = matchesTargetMood(movie);

              return (
                <div
                  key={movie.id}
                  onClick={() => {
                    onSelect(movie);
                    onClose();
                  }}
                  className={`py-3 px-3 rounded-xl flex items-center gap-3.5 hover:bg-white/5 cursor-pointer transition-all group border my-1 ${
                    isMoodMatch
                      ? 'border-indigo-500/30 bg-indigo-950/10'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={
                      movie.poster_url ||
                      (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
                      'https://via.placeholder.com/45x65?text=No+Poster'
                    }
                    alt={movie.title}
                    className="w-11 h-16 object-cover rounded-lg bg-slate-800 flex-shrink-0 shadow"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-100 group-hover:text-rose-400 transition-colors truncate">
                        {movie.title}
                      </h4>

                      {/* Prominent Target Mood Match Badge */}
                      {isMoodMatch && targetMoodObj && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0"
                          style={{
                            backgroundColor: `${targetMoodObj.color}25`,
                            color: targetMoodObj.color,
                            border: `1px solid ${targetMoodObj.color}50`,
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{targetMoodObj.label} Match</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{movie.release_date?.substring(0, 4) || '—'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {Number(movie.vote_average || 7).toFixed(1)}
                      </span>
                      {movie.runtime && (
                        <>
                          <span>•</span>
                          <span>{movie.runtime}m</span>
                        </>
                      )}
                    </div>

                    {/* Derived Mood Badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.moods && movie.moods.length > 0 ? (
                        movie.moods.slice(0, 2).map((m, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                            style={{
                              backgroundColor: `${m.color}20`,
                              color: m.color,
                            }}
                          >
                            {m.mood}
                          </span>
                        ))
                      ) : null}
                    </div>
                  </div>

                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all flex-shrink-0">
                    Select
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching movies found. Try another search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
