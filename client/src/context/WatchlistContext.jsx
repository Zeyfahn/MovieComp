import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load watchlist
  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    if (isAuthenticated) {
      try {
        const res = await api.getWatchlist();
        if (res.success && Array.isArray(res.watchlist)) {
          setWatchlist(res.watchlist);
        }
      } catch (err) {
        console.warn('Failed to load server watchlist:', err.message);
      }
    } else {
      // Local fallback
      try {
        const local = localStorage.getItem('movie_duel_guest_watchlist');
        if (local) setWatchlist(JSON.parse(local));
      } catch (e) {
        console.warn('Failed to load local watchlist');
      }
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const isInWatchlist = (movieId) => {
    const numId = Number(movieId);
    return watchlist.some((item) => Number(item.movieId || item.id) === numId);
  };

  const addToWatchlist = async (movie) => {
    const movieId = Number(movie.id || movie.movieId);
    if (isInWatchlist(movieId)) return;

    const newItem = {
      movieId,
      id: movieId,
      title: movie.title,
      poster_path: movie.poster_path || movie.poster_url,
      poster_url: movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      primary_mood: movie.primary_mood || null,
      savedAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setWatchlist((prev) => [newItem, ...prev]);

    if (isAuthenticated) {
      try {
        await api.addToWatchlist(movie);
      } catch (err) {
        console.error('Failed to sync watchlist addition to server:', err);
      }
    } else {
      const updated = [newItem, ...watchlist.filter((i) => Number(i.movieId || i.id) !== movieId)];
      localStorage.setItem('movie_duel_guest_watchlist', JSON.stringify(updated));
    }
  };

  const removeFromWatchlist = async (movieId) => {
    const numId = Number(movieId);
    setWatchlist((prev) => prev.filter((item) => Number(item.movieId || item.id) !== numId));

    if (isAuthenticated) {
      try {
        await api.removeFromWatchlist(numId);
      } catch (err) {
        console.error('Failed to sync watchlist removal to server:', err);
      }
    } else {
      const updated = watchlist.filter((item) => Number(item.movieId || item.id) !== numId);
      localStorage.setItem('movie_duel_guest_watchlist', JSON.stringify(updated));
    }
  };

  const toggleWatchlist = async (movie) => {
    const movieId = Number(movie.id || movie.movieId);
    if (isInWatchlist(movieId)) {
      await removeFromWatchlist(movieId);
      return false;
    } else {
      await addToWatchlist(movie);
      return true;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        refreshWatchlist: loadWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
