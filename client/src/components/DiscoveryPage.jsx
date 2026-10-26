import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HeroSection } from './HeroSection';
import { MoodChips, MOODS_LIST } from './MoodChips';
import { MovieCard } from './MovieCard';
import { api } from '../services/api';
import { Sparkles, Film, AlertCircle, RefreshCw, ListFilter, ArrowDownUp } from 'lucide-react';

export function DiscoveryPage({ onOpenDetails }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('prioritizeFirst'); // 'prioritizeFirst' | 'filterOnly'

  const exploreSectionRef = useRef(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTrending();
      if (res.success && res.movies) {
        setAllMovies(res.movies);
      }
    } catch (err) {
      console.error('Failed to load discovery movies:', err);
      setError('Unable to reach movie data service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const scrollToExplore = () => {
    if (exploreSectionRef.current) {
      exploreSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeMoodObj = MOODS_LIST.find((m) => m.id === selectedMood);

  // Compute displayed movies based on selectedMood and displayMode
  const displayedMovies = useMemo(() => {
    if (!selectedMood) {
      return allMovies;
    }

    const isMatch = (movie) =>
      movie.moods && movie.moods.some((m) => m.moodId === selectedMood && m.available);

    if (displayMode === 'filterOnly') {
      return allMovies.filter(isMatch);
    }

    // Default 'prioritizeFirst': matching movies show up first!
    return [...allMovies].sort((a, b) => {
      const aMatch = isMatch(a);
      const bMatch = isMatch(b);

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      // Secondary tie-breaker: rating desc
      return Number(b.vote_average || 0) - Number(a.vote_average || 0);
    });
  }, [allMovies, selectedMood, displayMode]);

  const matchingCount = useMemo(() => {
    if (!selectedMood) return 0;
    return allMovies.filter(
      (m) => m.moods && m.moods.some((x) => x.moodId === selectedMood && x.available)
    ).length;
  }, [allMovies, selectedMood]);

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

        {/* Section Heading with Count, Rule Info, and Prioritization Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>{activeMoodObj ? `${activeMoodObj.label} Mood Selection` : 'Popular & Trending Films'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {displayedMovies.length} {displayedMovies.length === 1 ? 'title' : 'titles'}
              </span>
            </h2>
            {activeMoodObj && (
              <p className="text-xs text-slate-400 mt-1">
                {displayMode === 'prioritizeFirst' ? (
                  <span>
                    Showing <strong className="text-rose-400">{matchingCount} matching {activeMoodObj.label.toLowerCase()} films</strong> first, followed by the rest of the catalog.
                  </span>
                ) : (
                  <span>
                    Showing only films matching <strong className="text-rose-400">{activeMoodObj.label.toLowerCase()}</strong> based on {activeMoodObj.ruleHint} metadata.
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* View Mode Toggle when Mood is Selected */}
            {selectedMood && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setDisplayMode('prioritizeFirst')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    displayMode === 'prioritizeFirst'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Show matching films first, then rest of the catalog"
                >
                  <ArrowDownUp className="w-3 h-3" />
                  <span>Show First ({matchingCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDisplayMode('filterOnly')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    displayMode === 'filterOnly'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Filter to only matching films"
                >
                  <ListFilter className="w-3 h-3" />
                  <span>Only {activeMoodObj.label}</span>
                </button>
              </div>
            )}

            <button
              onClick={fetchMovies}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors p-2 rounded-xl hover:bg-white/5"
              title="Refresh titles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
            <button
              onClick={fetchMovies}
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
        ) : displayedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {displayedMovies.map((movie) => (
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
