/**
 * Recommendation Engine - Rule-based & explainable movie recommendation.
 * PRD Section 5: Deterministic content-based ranking with transparent reasons.
 */

import { evaluateMovieMood, extractMovieGenres, enrichMovieWithMoods, MOOD_DEFINITIONS } from './moodEngine.js';

/**
 * Computes recommendation score and explanation for a single movie given user preferences.
 * @param {Object} movie
 * @param {Object} preferences { moods: string[], favoriteGenres: string[], targetRuntime?: number }
 */
export function scoreRecommendation(movie, preferences = {}) {
  const { moods = [], favoriteGenres = [], targetRuntime = null } = preferences;

  let totalScore = 0;
  const matchReasons = [];
  const matchedMoods = [];
  const matchedGenres = [];

  const { names: movieGenres, hasData } = extractMovieGenres(movie);

  // 1. Mood Matching (highest priority: 45 pts per matching preferred mood, max 90)
  if (moods.length > 0) {
    moods.forEach((mId) => {
      const moodEval = evaluateMovieMood(movie, mId);
      if (moodEval.matched) {
        matchedMoods.push(moodEval.mood);
        totalScore += 45;
        matchReasons.push(`Matches your "${moodEval.mood}" mood through ${moodEval.matchedGenres.join(', ')} genre metadata`);
      }
    });
  }

  // 2. Favorite Genres Matching (30 pts per match, max 60)
  if (favoriteGenres.length > 0 && hasData) {
    const favLower = favoriteGenres.map((g) => String(g).toLowerCase());
    movieGenres.forEach((gName) => {
      if (favLower.includes(gName.toLowerCase())) {
        matchedGenres.push(gName);
        totalScore += 30;
      }
    });

    if (matchedGenres.length > 0) {
      matchReasons.push(`Aligns with your favorite genre: ${matchedGenres.join(', ')}`);
    }
  }

  // 3. Quality Signal (Normalized Rating: up to 20 pts)
  const rating = Number(movie.vote_average ?? movie.rating ?? 0);
  if (rating > 0) {
    const ratingBonus = (rating / 10) * 20;
    totalScore += ratingBonus;
  }

  // 4. Runtime Fit Bonus (up to 15 pts if target runtime is specified)
  if (targetRuntime && movie.runtime) {
    const diff = Math.abs(movie.runtime - targetRuntime);
    const runtimeScore = Math.max(0, 15 - (diff / targetRuntime) * 15);
    totalScore += runtimeScore;
    if (diff <= 15) {
      matchReasons.push(`Fits your runtime target of ~${targetRuntime} min (${movie.runtime} min)`);
    }
  }

  // Fallback reason if anonymous / no custom match
  let primaryReason = '';
  if (matchReasons.length > 0) {
    primaryReason = matchReasons.join('. ') + '.';
  } else {
    primaryReason = `Popular trending film with a rating of ${(rating || 7).toFixed(1)}/10.`;
  }

  return {
    score: Number(totalScore.toFixed(1)),
    matchedMoods,
    matchedGenres,
    recommendationReason: primaryReason,
    matchCount: matchedMoods.length + matchedGenres.length,
  };
}

/**
 * Ranks candidate movies based on user preferences.
 * @param {Array} candidateMovies
 * @param {Object} preferences { moods: string[], favoriteGenres: string[], targetRuntime: number }
 * @param {number} limit
 */
export function rankRecommendations(candidateMovies = [], preferences = {}, limit = 12) {
  if (!Array.isArray(candidateMovies) || candidateMovies.length === 0) {
    return [];
  }

  const scoredMovies = candidateMovies.map((movie) => {
    const enriched = enrichMovieWithMoods(movie);
    const { score, matchedMoods, matchedGenres, recommendationReason, matchCount } =
      scoreRecommendation(enriched, preferences);

    return {
      ...enriched,
      recommendationScore: score,
      recommendationReason,
      matchedMoods,
      matchedGenres,
      matchCount,
    };
  });

  // Sort by recommendationScore desc, then by rating desc, then popularity desc
  scoredMovies.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }
    const ratingA = Number(a.vote_average || 0);
    const ratingB = Number(b.vote_average || 0);
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    const popA = Number(a.popularity || 0);
    const popB = Number(b.popularity || 0);
    return popB - popA;
  });

  return scoredMovies.slice(0, limit);
}
