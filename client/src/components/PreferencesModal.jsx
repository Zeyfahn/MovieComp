import React, { useState, useEffect } from 'react';
import { X, Sliders, Check, Sparkles, Clock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOODS_LIST } from './MoodChips';

const POPULAR_GENRES = [
  'Science Fiction',
  'Thriller',
  'Drama',
  'Adventure',
  'Comedy',
  'Crime',
  'Mystery',
  'Animation',
  'Fantasy',
  'Romance',
  'Horror',
  'Family',
];

export function PreferencesModal() {
  const { user, isPreferencesOpen, closePreferences, updatePreferences } = useAuth();

  const [selectedMoods, setSelectedMoods] = useState(['mind-bending', 'dark-and-intense']);
  const [selectedGenres, setSelectedGenres] = useState(['Science Fiction', 'Thriller']);
  const [targetRuntime, setTargetRuntime] = useState(120);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && user.preferences) {
      if (user.preferences.moods) setSelectedMoods(user.preferences.moods);
      if (user.preferences.favoriteGenres) setSelectedGenres(user.preferences.favoriteGenres);
      if (user.preferences.targetRuntime) setTargetRuntime(user.preferences.targetRuntime);
    }
  }, [user]);

  if (!isPreferencesOpen) return null;

  const toggleMood = (id) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaved(false);
    await updatePreferences({
      moods: selectedMoods,
      favoriteGenres: selectedGenres,
      targetRuntime: Number(targetRuntime),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closePreferences();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={closePreferences} />

      <div className="relative w-full max-w-xl glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl z-10 my-8">
        <button
          onClick={closePreferences}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-extrabold text-white">Movie Duel Preferences</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Personalize your recommendation ranking and duel criteria weights.
        </p>

        {/* 1. Preferred Moods */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Favorite Moods
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOODS_LIST.map((m) => {
              const isChecked = selectedMoods.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMood(m.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                    isChecked
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-white/5'
                  }`}
                  style={{
                    backgroundColor: isChecked ? `${m.color}30` : undefined,
                    borderColor: isChecked ? m.color : undefined,
                  }}
                >
                  <span className="truncate">{m.label}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: m.color }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Favorite Genres */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-indigo-400" />
            Favorite TMDB Genres
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_GENRES.map((genre) => {
              const isChecked = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-white/5'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Target Runtime */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Target Film Runtime
            </label>
            <span className="text-xs font-bold text-emerald-400">{targetRuntime} minutes</span>
          </div>
          <input
            type="range"
            min="60"
            max="210"
            step="5"
            value={targetRuntime}
            onChange={(e) => setTargetRuntime(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>60 min (Quick watch)</span>
            <span>120 min (Standard)</span>
            <span>210 min (Epic)</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-lg'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </div>
    </div>
  );
}
