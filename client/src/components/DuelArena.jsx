import React, { useState } from 'react';
import {
  Swords,
  Trophy,
  ArrowRightLeft,
  X,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Clock,
  Star,
  Plus,
} from 'lucide-react';
import { useDuel } from '../context/DuelContext';
import { MOODS_LIST } from './MoodChips';
import { MoviePickerModal } from './MoviePickerModal';

export function DuelArena() {
  const {
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
    clearSlot,
    swapSlots,
    resetWeights,
    runDuel,
  } = useDuel();

  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [pickerModalSlot, setPickerModalSlot] = useState(null); // 1 or 2 or null

  const handleWeightChange = (key, val) => {
    setWeights((prev) => ({
      ...prev,
      [key]: parseFloat(val),
    }));
  };

  const getPoster = (movie) => {
    if (!movie) return null;
    return (
      movie.poster_url ||
      (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null) ||
      'https://via.placeholder.com/300x450?text=No+Poster'
    );
  };

  const currentMoodObj = MOODS_LIST.find((m) => m.id === selectedMood) || MOODS_LIST[0];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Swords className="w-4 h-4" />
          Explainable Film Comparison Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Movie <span className="bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">Duel</span> Arena
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
          Compare two films side-by-side. Our deterministic rule engine calculates the better match for your current mood and criteria.
        </p>
      </div>

      {/* Duel Control Bar (Mood & Weights) */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 mb-8 border border-white/10 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Target Mood Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Target Mood:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {MOODS_LIST.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedMood === m.id
                      ? 'text-white border-transparent shadow-lg'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border-white/5'
                  }`}
                  style={{
                    backgroundColor: selectedMood === m.id ? m.color : undefined,
                    boxShadow: selectedMood === m.id ? `0 0 15px ${m.color}60` : undefined,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                showWeightSliders
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showWeightSliders ? 'Hide Criteria Weights' : 'Custom Weights'}</span>
            </button>

            {slot1 && slot2 && (
              <button
                onClick={swapSlots}
                title="Swap Movie Slots"
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Weights Customizer (PRD Section 5) */}
        {showWeightSliders && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Mood Match</span>
                <span className="text-rose-400">{Math.round(weights.mood_match * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.mood_match}
                onChange={(e) => handleWeightChange('mood_match', e.target.value)}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Heuristic mood match</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Genre Overlap</span>
                <span className="text-indigo-400">{Math.round(weights.genre_preference * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.genre_preference}
                onChange={(e) => handleWeightChange('genre_preference', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">User genre preferences</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>TMDB Rating</span>
                <span className="text-amber-400">{Math.round(weights.tmdb_rating * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.tmdb_rating}
                onChange={(e) => handleWeightChange('tmdb_rating', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Normalized TMDB score</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
              <div className="flex justify-between font-semibold text-slate-300 mb-1.5">
                <span>Runtime Fit</span>
                <span className="text-emerald-400">{Math.round(weights.runtime_fit * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.runtime_fit}
                onChange={(e) => handleWeightChange('runtime_fit', e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Target:</span>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={targetRuntime}
                  onChange={(e) => setTargetRuntime(Number(e.target.value))}
                  className="w-14 bg-slate-800 border border-white/10 rounded px-1 text-center text-slate-200"
                />
                <span>min</span>
              </div>
            </div>

            <div className="col-span-full flex justify-end">
              <button
                onClick={resetWeights}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Default Weights
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duel Error Banner */}
      {duelError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{duelError}</span>
        </div>
      )}

      {/* The Two Fighters Duel Ring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative mb-8">
        {/* Center VS Shield Badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 items-center justify-center font-black text-xl text-white shadow-2xl shadow-rose-500/40 ring-4 ring-[#090B10]">
          VS
        </div>

        {/* Slot 1 Fighter */}
        <div
          className={`rounded-3xl p-6 glass-panel-elevated border transition-all duration-300 ${
            slot1 ? 'border-rose-500/40 shadow-xl' : 'border-dashed border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Slot 1 Contender
            </span>
            {slot1 && (
              <button
                onClick={() => clearSlot(1)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {slot1 ? (
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <img
                src={getPoster(slot1)}
                alt={slot1.title}
                className="w-36 aspect-[2/3] object-cover rounded-2xl shadow-lg border border-white/10"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-extrabold text-xl text-white line-clamp-2">
                  {slot1.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 mt-1 mb-3">
                  <span>{slot1.release_date?.substring(0, 4) || '—'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">★ {Number(slot1.vote_average || 7).toFixed(1)}</span>
                  {slot1.runtime && (
                    <>
                      <span>•</span>
                      <span>{slot1.runtime}m</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 line-clamp-3 mb-4">
                  {slot1.overview || 'No synopsis available.'}
                </p>
                <button
                  onClick={() => setPickerModalSlot(1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Change Movie
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setPickerModalSlot(1)}
              className="py-16 text-center cursor-pointer hover:bg-white/5 rounded-2xl transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-200">Select Movie 1</div>
              <div className="text-xs text-slate-500 mt-1">Click to choose a candidate</div>
            </div>
          )}
        </div>

        {/* Slot 2 Fighter */}
        <div
          className={`rounded-3xl p-6 glass-panel-elevated border transition-all duration-300 ${
            slot2 ? 'border-indigo-500/40 shadow-xl' : 'border-dashed border-white/15'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Slot 2 Contender
            </span>
            {slot2 && (
              <button
                onClick={() => clearSlot(2)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {slot2 ? (
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <img
                src={getPoster(slot2)}
                alt={slot2.title}
                className="w-36 aspect-[2/3] object-cover rounded-2xl shadow-lg border border-white/10"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-extrabold text-xl text-white line-clamp-2">
                  {slot2.title}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 mt-1 mb-3">
                  <span>{slot2.release_date?.substring(0, 4) || '—'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">★ {Number(slot2.vote_average || 7).toFixed(1)}</span>
                  {slot2.runtime && (
                    <>
                      <span>•</span>
                      <span>{slot2.runtime}m</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 line-clamp-3 mb-4">
                  {slot2.overview || 'No synopsis available.'}
                </p>
                <button
                  onClick={() => setPickerModalSlot(2)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Change Movie
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setPickerModalSlot(2)}
              className="py-16 text-center cursor-pointer hover:bg-white/5 rounded-2xl transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-200">Select Movie 2</div>
              <div className="text-xs text-slate-500 mt-1">Click to choose a candidate</div>
            </div>
          )}
        </div>
      </div>

      {/* Fight / Calculate Duel Button */}
      <div className="text-center mb-12">
        <button
          onClick={runDuel}
          disabled={!slot1 || !slot2 || isCalculating}
          className={`px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg flex items-center gap-3 mx-auto shadow-2xl transition-all duration-300 ${
            slot1 && slot2 && !isCalculating
              ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:scale-105 shadow-rose-500/30 text-white cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
          }`}
        >
          {isCalculating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Film Rules & Metadata...</span>
            </>
          ) : (
            <>
              <Swords className="w-6 h-6" />
              <span>Initiate Movie Duel</span>
            </>
          )}
        </button>
      </div>

      {/* Duel Results Display Panel (PRD Section 5 & FR-05, FR-06) */}
      {duelResult && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl animate-in fade-in duration-500">
          {/* Outcome Header Banner */}
          <div
            className={`p-6 rounded-2xl text-center mb-8 border ${
              duelResult.outcomeType === 'winner'
                ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border-rose-500/50 shadow-xl'
                : duelResult.outcomeType === 'tie'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-900 border-white/15'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-white/10">
              {duelResult.outcomeType === 'winner' ? (
                <>
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Duel Verdict</span>
                </>
              ) : duelResult.outcomeType === 'tie' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Close Match</span>
                </>
              ) : (
                <span>Inconclusive Outcome</span>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              {duelResult.verdict}
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {duelResult.explanation}
            </p>
          </div>

          {/* Side-by-Side Overall Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Fighter 1 Score Card */}
            <div
              className={`p-5 rounded-2xl border ${
                duelResult.winnerId === duelResult.movie1.id
                  ? 'bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-rose-400">Contender 1</span>
                  <h4 className="font-extrabold text-lg text-white">{duelResult.movie1.title}</h4>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">
                    {duelResult.movie1.totalScore}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Score / 100</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3">
                {Object.entries(duelResult.movie1.breakdown).map(([crit, data]) => {
                  const label = crit.replace('_', ' ');
                  return (
                    <div key={crit} className="text-xs">
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="capitalize">{label}</span>
                        <span className="font-bold text-rose-400">
                          {data.score} <span className="text-slate-500 text-[10px]">({data.weightedScore} pts)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700"
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{data.reason}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fighter 2 Score Card */}
            <div
              className={`p-5 rounded-2xl border ${
                duelResult.winnerId === duelResult.movie2.id
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-400">Contender 2</span>
                  <h4 className="font-extrabold text-lg text-white">{duelResult.movie2.title}</h4>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">
                    {duelResult.movie2.totalScore}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Score / 100</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3">
                {Object.entries(duelResult.movie2.breakdown).map(([crit, data]) => {
                  const label = crit.replace('_', ' ');
                  return (
                    <div key={crit} className="text-xs">
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="capitalize">{label}</span>
                        <span className="font-bold text-indigo-400">
                          {data.score} <span className="text-slate-500 text-[10px]">({data.weightedScore} pts)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{data.reason}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Missing Data Disclosure & Renormalization Info (PRD Section 5 & 10) */}
          {duelResult.unavailableCriteria && duelResult.unavailableCriteria.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs">
              <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Transparent Metadata & Renormalization Notice
              </div>
              <p className="text-slate-400 mb-2 leading-relaxed">
                To maintain a fair and unbiased comparison, criteria unavailable for either title are omitted from the calculation, and the weights of remaining shared criteria are renormalized to 100%.
              </p>
              <div className="space-y-1">
                {duelResult.unavailableCriteria.map((item, idx) => (
                  <div key={idx} className="text-[11px] text-slate-400">
                    • <strong className="text-slate-300 capitalize">{item.criterion.replace('_', ' ')}</strong>: Omitted ({item.reason1} | {item.reason2})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Movie Picker Modal */}
      {pickerModalSlot && (
        <MoviePickerModal
          slotNumber={pickerModalSlot}
          excludeMovieId={pickerModalSlot === 1 ? slot2?.id : slot1?.id}
          onSelect={(movie) => selectMovie(movie, pickerModalSlot)}
          onClose={() => setPickerModalSlot(null)}
        />
      )}
    </div>
  );
}
