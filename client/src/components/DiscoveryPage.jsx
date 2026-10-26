import React, { useState, useEffect, useRef } from 'react';
import { HeroSection } from './HeroSection';
import { MoodChips, MOODS_LIST } from './MoodChips';
import { MovieCard } from './MovieCard';
import { api } from '../services/api';
import { Sparkles, Film, AlertCircle, RefreshCw } from 'lucide-react';

export function DiscoveryPage({ onOpenDetails }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const exploreSectionRef = useRef(null);

  const fetchMovies = async (mood) => {
    setLoading(true);
    setError(null);
    try {
      if (mood) {
        const res = await api.discoverByMood(mood);
        if (res.success && res.movies) {
          setMovies(res.movies);
        }
      } else {
        const res = await api.getTrending();
        if (res.success && res.movies) {
          setMovies(res.movies);
        }
      }
    } catch (err) {
      console.error('Failed to load discovery movies:', err);
      setError('Unable to reach movie data service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(selectedMood);
  }, [selectedMood]);

  const scrollToExplore = () => {
    if (exploreSectionRef.current) {
      exploreSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeMoodObj = MOODS_LIST.find((m) => m.id === selectedMood);

  return (
    <div>
      {/* Cinematic Hero */}
      <HeroSection onExploreClick={scrollToExplore} />

      {/* Discovery Section */}
      <div ref={exploreSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mood Chips Selector */}
        <div className="mb-8">
          <MoodChips selectedMood={selectedMood} onSelectMood={setSelectedMood} />
        </div>

        {/* Section Heading with Count & Rule Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>{activeMoodObj ? `${activeMoodObj.label} Films` : 'Popular & Trending Films'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {movies.length}
              </span>
            </h2>
            {activeMoodObj && (
              <p className="text-xs text-slate-400 mt-1">
                Films tagged <span className="text-rose-400">{activeMoodObj.label.toLowerCase()}</span> based on {activeMoodObj.ruleHint} metadata.
              </p>
            )}
          </div>

          <button
            onClick={() => fetchMovies(selectedMood)}
            className="self-start sm:self-auto text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
            <button
              onClick={() => fetchMovies(selectedMood)}
              className="ml-auto underline font-semibold text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-slate-900/60 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center glass-panel rounded-3xl p-8 max-w-md mx-auto">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No titles match this filter</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Try selecting a different mood chip above or explore all trending films.
            </p>
            <button
              onClick={() => setSelectedMood(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
