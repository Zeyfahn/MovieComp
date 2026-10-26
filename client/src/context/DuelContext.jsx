import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const DuelContext = createContext();

export function DuelProvider({ children }) {
  const { user } = useAuth();
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [selectedMood, setSelectedMood] = useState('mind-bending');
  const [weights, setWeights] = useState({
    mood_match: 0.35,
    genre_preference: 0.25,
    tmdb_rating: 0.25,
    runtime_fit: 0.15,
  });
  const [targetRuntime, setTargetRuntime] = useState(120);
  const [duelResult, setDuelResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [duelError, setDuelError] = useState(null);

  // If user preferences load, align default mood
  useEffect(() => {
    if (user && user.preferences && user.preferences.moods && user.preferences.moods.length > 0) {
      setSelectedMood(user.preferences.moods[0]);
    }
  }, [user]);

  const selectMovie = (movie, slot = 1) => {
    setDuelError(null);
    if (slot === 1) {
      if (slot2 && String(slot2.id) === String(movie.id)) {
        setDuelError('Cannot select the same movie for both slots.');
        return;
      }
      setSlot1(movie);
    } else {
      if (slot1 && String(slot1.id) === String(movie.id)) {
        setDuelError('Cannot select the same movie for both slots.');
        return;
      }
      setSlot2(movie);
    }
  };

  const quickDuel = (movie) => {
    setDuelError(null);
    if (!slot1) {
      setSlot1(movie);
    } else if (!slot2) {
      if (String(slot1.id) === String(movie.id)) {
        setDuelError('Select two different movies to compare.');
        return;
      }
      setSlot2(movie);
    } else {
      // If both filled, replace slot 2
      if (String(slot1.id) === String(movie.id)) {
        setDuelError('Movie is already in Slot 1.');
        return;
      }
      setSlot2(movie);
    }
  };

  const clearSlot = (slot) => {
    setDuelError(null);
    setDuelResult(null);
    if (slot === 1) setSlot1(null);
    if (slot === 2) setSlot2(null);
  };

  const swapSlots = () => {
    const temp = slot1;
    setSlot1(slot2);
    setSlot2(temp);
    setDuelResult(null);
  };

  const resetWeights = () => {
    setWeights({
      mood_match: 0.35,
      genre_preference: 0.25,
      tmdb_rating: 0.25,
      runtime_fit: 0.15,
    });
  };

  const runDuel = async () => {
    if (!slot1 || !slot2) {
      setDuelError('Please choose two movies to start the duel.');
      return;
    }
    if (String(slot1.id) === String(slot2.id)) {
      setDuelError('Cannot duel a movie with itself. Please select two distinct titles.');
      return;
    }

    setIsCalculating(true);
    setDuelError(null);

    try {
      const res = await api.compareMovies({
        movie1Id: slot1.id,
        movie2Id: slot2.id,
        moodId: selectedMood,
        weights,
        userPreferredGenres: user?.preferences?.favoriteGenres || [],
        targetRuntime: Number(targetRuntime) || 120,
      });

      if (res.success && res.duel) {
        setDuelResult(res.duel);

        // If clear winner, launch festive confetti!
        if (res.duel.outcomeType === 'winner') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F43F5E', '#6366F1', '#F59E0B', '#10B981'],
          });
        }
      } else {
        setDuelError(res.error || 'Failed to calculate duel.');
      }
    } catch (err) {
      setDuelError(err.message || 'Comparison failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <DuelContext.Provider
      value={{
        slot1,
        slot2,
        selectedMood,
        setSelectedMood,
        weights,
        setWeights,
        targetRuntime,
        setTargetRuntime,
        duelResult,
        isCalculating,
        duelError,
        selectMovie,
        quickDuel,
        clearSlot,
        swapSlots,
        resetWeights,
        runDuel,
        setDuelResult,
      }}
    >
      {children}
    </DuelContext.Provider>
  );
}

export function useDuel() {
  const context = useContext(DuelContext);
  if (!context) {
    throw new Error('useDuel must be used within a DuelProvider');
  }
  return context;
}
