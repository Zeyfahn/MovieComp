/**
 * Movie Duel Scoring Engine
 * Deterministic, explainable movie comparison based on PRD Section 5.
 */

import { evaluateMovieMood, extractMovieGenres } from './moodEngine.js';

// Default criterion weights (sum = 1.0)
export const DEFAULT_CRITERIA_WEIGHTS = {
  mood_match: 0.35,
  genre_preference: 0.25,
  tmdb_rating: 0.25,
  runtime_fit: 0.15,
};

// Tie threshold as specified in PRD Section 5 (< 3 points)
export const TIE_THRESHOLD = 3.0;

/**
 * Validates weights supplied by the client.
 * Returns { valid: boolean, message?: string }
 */
export function validateWeights(weights) {
  if (!weights) return { valid: true };
  for (const [key, value] of Object.entries(weights)) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return {
        valid: false,
        message: `Criterion weight "${key}" must be a non-negative number. Received: ${value}`,
      };
    }
  }
  return { valid: true };
}

/**
 * Calculates raw score and availability for an individual criterion for a movie.
 */
export function evaluateCriterion(criterion, movie, context) {
  const { moodId, userPreferredGenres = [], targetRuntime = null } = context;

  switch (criterion) {
    case 'mood_match': {
      const moodEval = evaluateMovieMood(movie, moodId);
      if (!moodEval.available) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: Movie lacks genre metadata to evaluate mood.',
        };
      }
      return {
        available: true,
        score: moodEval.matched ? 100 : 0,
        reason: moodEval.matched
          ? `Matches ${moodEval.mood} mood via ${moodEval.matchedGenres.join(', ')}.`
          : `Does not match ${moodEval.mood} mood.`,
        details: moodEval,
      };
    }

    case 'genre_preference': {
      if (!userPreferredGenres || userPreferredGenres.length === 0) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: No user genre preferences provided.',
        };
      }
      const { names, hasData } = extractMovieGenres(movie);
      if (!hasData) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: Movie lacks genre metadata.',
        };
      }

      // Check case-insensitive overlap
      const preferredLower = userPreferredGenres.map((g) => String(g).toLowerCase());
      const matchingGenres = names.filter((n) =>
        preferredLower.includes(n.toLowerCase())
      );

      const ratio = matchingGenres.length / userPreferredGenres.length;
      const score = Math.round(Math.min(100, ratio * 100));

      return {
        available: true,
        score,
        reason:
          matchingGenres.length > 0
            ? `Matches ${matchingGenres.length} of ${userPreferredGenres.length} preferred genres (${matchingGenres.join(', ')}).`
            : `Matches 0 of ${userPreferredGenres.length} preferred genres.`,
        matchingGenres,
      };
    }

    case 'tmdb_rating': {
      const rating = movie.vote_average ?? movie.rating;
      const voteCount = movie.vote_count ?? 0;

      if (rating === undefined || rating === null || isNaN(rating) || Number(rating) === 0) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: No TMDB rating data recorded for this title.',
        };
      }

      const score = Math.round(Math.min(100, Math.max(0, Number(rating) * 10)));
      const voteLabel = voteCount > 0
        ? `${voteCount.toLocaleString()} votes`
        : 'limited vote data';
      return {
        available: true,
        score,
        reason: `Rating: ${Number(rating).toFixed(1)}/10 based on ${voteLabel}.`,
        voteAverage: Number(rating),
        voteCount,
      };
    }

    case 'runtime_fit': {
      if (!targetRuntime || targetRuntime <= 0) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: No target runtime specified.',
        };
      }

      const runtime = Number(movie.runtime);
      if (!runtime || isNaN(runtime) || runtime <= 0) {
        return {
          available: false,
          score: null,
          reason: 'Unavailable: Movie runtime is unknown.',
        };
      }

      const diff = Math.abs(runtime - targetRuntime);
      const fitScore = Math.max(0, Math.round(100 - (diff / targetRuntime) * 100));

      return {
        available: true,
        score: fitScore,
        reason: `${runtime} min vs target ${targetRuntime} min (${diff} min difference).`,
        runtime,
        targetRuntime,
      };
    }

    default:
      return { available: false, score: null, reason: 'Unknown criterion' };
  }
}

/**
 * Executes a deterministic comparison duel between two movies.
 */
export function calculateMovieDuel({
  movie1,
  movie2,
  moodId,
  userWeights = {},
  userPreferredGenres = [],
  targetRuntime = null,
}) {
  // Edge Case 1: Missing movie
  if (!movie1 || !movie2) {
    throw new Error('Both movies must be provided for comparison.');
  }

  // Edge Case 2: Same movie selected twice (PRD Section 10)
  if (String(movie1.id) === String(movie2.id)) {
    throw new Error('Cannot duel a movie with itself. Please select two distinct titles.');
  }

  // Validate custom weights
  const weightVal = validateWeights(userWeights);
  if (!weightVal.valid) {
    throw new Error(weightVal.message);
  }

  const rawWeights = { ...DEFAULT_CRITERIA_WEIGHTS, ...userWeights };
  const context = { moodId, userPreferredGenres, targetRuntime };

  const criteriaKeys = Object.keys(DEFAULT_CRITERIA_WEIGHTS);
  const evaluation1 = {};
  const evaluation2 = {};
  const availableCriteria = [];
  const unavailableCriteria = [];

  // Evaluate each criterion for both movies
  for (const criterion of criteriaKeys) {
    const res1 = evaluateCriterion(criterion, movie1, context);
    const res2 = evaluateCriterion(criterion, movie2, context);

    evaluation1[criterion] = res1;
    evaluation2[criterion] = res2;

    // Both must be available to include in fair comparison
    if (res1.available && res2.available && rawWeights[criterion] > 0) {
      availableCriteria.push(criterion);
    } else {
      unavailableCriteria.push({
        criterion,
        reason1: res1.available ? 'Available' : res1.reason,
        reason2: res2.available ? 'Available' : res2.reason,
      });
    }
  }

  // Inconclusive check: insufficient criteria
  if (availableCriteria.length === 0) {
    return {
      status: 'inconclusive',
      verdict: 'Inconclusive: Insufficient shared metadata to compare these movies fairly.',
      explanation:
        'Neither movie had enough overlapping criteria (such as rating, mood metadata, or preferences) to calculate an explainable duel score.',
      movie1: { id: movie1.id, title: movie1.title, totalScore: null, breakdown: evaluation1 },
      movie2: { id: movie2.id, title: movie2.title, totalScore: null, breakdown: evaluation2 },
      availableCriteria: [],
      unavailableCriteria,
      tieThreshold: TIE_THRESHOLD,
    };
  }

  // Renormalize remaining available weights to sum to 1.0
  const sumAvailableWeights = availableCriteria.reduce(
    (acc, crit) => acc + rawWeights[crit],
    0
  );

  const normalizedWeights = {};
  availableCriteria.forEach((crit) => {
    normalizedWeights[crit] = rawWeights[crit] / sumAvailableWeights;
  });

  // Calculate weighted scores
  let totalScore1 = 0;
  let totalScore2 = 0;
  const breakdown1 = {};
  const breakdown2 = {};
  const criterionDeltas = [];

  availableCriteria.forEach((crit) => {
    const weight = normalizedWeights[crit];
    const score1 = evaluation1[crit].score;
    const score2 = evaluation2[crit].score;

    const weightedScore1 = score1 * weight;
    const weightedScore2 = score2 * weight;

    totalScore1 += weightedScore1;
    totalScore2 += weightedScore2;

    breakdown1[crit] = {
      score: score1,
      weightedScore: Number(weightedScore1.toFixed(2)),
      weight: Number(weight.toFixed(3)),
      reason: evaluation1[crit].reason,
    };

    breakdown2[crit] = {
      score: score2,
      weightedScore: Number(weightedScore2.toFixed(2)),
      weight: Number(weight.toFixed(3)),
      reason: evaluation2[crit].reason,
    };

    const delta = weightedScore1 - weightedScore2;
    criterionDeltas.push({
      criterion: crit,
      weight,
      score1,
      score2,
      delta,
      absDelta: Math.abs(delta),
    });
  });

  totalScore1 = Number(totalScore1.toFixed(1));
  totalScore2 = Number(totalScore2.toFixed(1));

  // Determine winner or tie
  const diff = Math.abs(totalScore1 - totalScore2);
  const isTie = diff < TIE_THRESHOLD;

  let winner = null;
  let loser = null;
  let verdict = '';
  let outcomeType = 'winner'; // 'winner' | 'tie'

  if (isTie) {
    outcomeType = 'tie';
    verdict = 'Too close to call (Tie)';
  } else if (totalScore1 > totalScore2) {
    winner = movie1;
    loser = movie2;
    verdict = `${movie1.title} is the stronger match for your current mood & preferences.`;
  } else {
    winner = movie2;
    loser = movie1;
    verdict = `${movie2.title} is the stronger match for your current mood & preferences.`;
  }

  // Find biggest decisive contributors
  criterionDeltas.sort((a, b) => b.absDelta - a.absDelta);
  const topFactors = criterionDeltas.slice(0, 2).map((factor) => {
    const critName = factor.criterion.replace('_', ' ');
    if (factor.delta > 0) {
      return `${movie1.title} gained an advantage in ${critName} (${factor.score1} vs ${factor.score2})`;
    } else if (factor.delta < 0) {
      return `${movie2.title} gained an advantage in ${critName} (${factor.score2} vs ${factor.score1})`;
    } else {
      return `Both movies tied evenly in ${critName} (${factor.score1} each)`;
    }
  });

  const decisiveExplanation = isTie
    ? `The comparison difference was ${diff.toFixed(1)} points, which is within the ${TIE_THRESHOLD}-point tie threshold. Both films are equally compelling options.`
    : `${winner.title} scored ${Math.max(totalScore1, totalScore2)} vs ${Math.min(totalScore1, totalScore2)} for ${loser.title} (${diff.toFixed(1)} point margin). Key factors: ${topFactors.join('; ')}.`;

  return {
    status: 'success',
    outcomeType,
    isTie,
    verdict,
    explanation: decisiveExplanation,
    moodId,
    scoreDifference: Number(diff.toFixed(1)),
    tieThreshold: TIE_THRESHOLD,
    winnerId: winner ? winner.id : null,
    winnerTitle: winner ? winner.title : null,
    movie1: {
      id: movie1.id,
      title: movie1.title,
      poster_path: movie1.poster_path,
      release_date: movie1.release_date,
      totalScore: totalScore1,
      breakdown: breakdown1,
    },
    movie2: {
      id: movie2.id,
      title: movie2.title,
      poster_path: movie2.poster_path,
      release_date: movie2.release_date,
      totalScore: totalScore2,
      breakdown: breakdown2,
    },
    normalizedWeights,
    availableCriteria,
    unavailableCriteria,
  };
}
