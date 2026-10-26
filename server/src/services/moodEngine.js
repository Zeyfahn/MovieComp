/**
 * Mood Tag Engine - Rule-based explainable mood mapping.
 * Derived from TMDB genre metadata according to PRD Section 4.
 */

// TMDB Genre IDs
export const TMDB_GENRES = {
  ACTION: 28,
  ADVENTURE: 12,
  ANIMATION: 16,
  COMEDY: 35,
  CRIME: 80,
  DOCUMENTARY: 99,
  DRAMA: 18,
  FAMILY: 10751,
  FANTASY: 14,
  HISTORY: 36,
  HORROR: 27,
  MUSIC: 10402,
  MYSTERY: 9648,
  ROMANCE: 10749,
  SCIENCE_FICTION: 878,
  TV_MOVIE: 10770,
  THRILLER: 53,
  WAR: 10752,
  WESTERN: 37,
};

// Genre ID to Name mapping
export const GENRE_ID_TO_NAME = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// 8 Defined Moods with Rule Specifications (PRD Section 4)
export const MOOD_DEFINITIONS = [
  {
    id: 'mind-bending',
    label: 'Mind-bending',
    description: 'Intellectually thrilling, reality-shifting or enigmatic stories',
    genreIds: [TMDB_GENRES.SCIENCE_FICTION, TMDB_GENRES.MYSTERY],
    genreNames: ['Science Fiction', 'Mystery'],
    color: '#8B5CF6', // Purple / Violet
    icon: 'Brain',
  },
  {
    id: 'feel-good',
    label: 'Feel-good',
    description: 'Heartwarming, humorous, and uplifting entertainment',
    genreIds: [TMDB_GENRES.COMEDY, TMDB_GENRES.FAMILY, TMDB_GENRES.ANIMATION],
    genreNames: ['Comedy', 'Family', 'Animation'],
    color: '#F59E0B', // Amber / Sun
    icon: 'Smile',
  },
  {
    id: 'dark-and-intense',
    label: 'Dark and intense',
    description: 'Gritty, high-stakes thrills, crime drama or horror',
    genreIds: [TMDB_GENRES.THRILLER, TMDB_GENRES.CRIME, TMDB_GENRES.HORROR],
    genreNames: ['Thriller', 'Crime', 'Horror'],
    color: '#EF4444', // Crimson / Red
    icon: 'Flame',
  },
  {
    id: 'emotional',
    label: 'Emotional',
    description: 'Deep human connections, passion, heartbreak and drama',
    genreIds: [TMDB_GENRES.DRAMA, TMDB_GENRES.ROMANCE],
    genreNames: ['Drama', 'Romance'],
    color: '#EC4899', // Pink / Rose
    icon: 'Heart',
  },
  {
    id: 'uplifting',
    label: 'Uplifting',
    description: 'Inspiring, joyful narratives that raise spirits',
    genreIds: [TMDB_GENRES.FAMILY, TMDB_GENRES.ANIMATION, TMDB_GENRES.MUSIC],
    genreNames: ['Family', 'Animation', 'Music'],
    color: '#10B981', // Emerald / Green
    icon: 'Sparkles',
  },
  {
    id: 'cozy',
    label: 'Cozy',
    description: 'Comforting, gentle, easy-watching stories',
    genreIds: [TMDB_GENRES.FAMILY, TMDB_GENRES.ANIMATION, TMDB_GENRES.ROMANCE],
    genreNames: ['Family', 'Animation', 'Romance'],
    color: '#F97316', // Warm Orange
    icon: 'Coffee',
  },
  {
    id: 'suspenseful',
    label: 'Suspenseful',
    description: 'Tense mysteries and edge-of-your-seat investigative intrigue',
    genreIds: [TMDB_GENRES.THRILLER, TMDB_GENRES.MYSTERY, TMDB_GENRES.CRIME],
    genreNames: ['Thriller', 'Mystery', 'Crime'],
    color: '#06B6D4', // Cyan / Cold blue
    icon: 'Eye',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    description: 'Epic journeys, bold explorations, and fantastical realms',
    genreIds: [TMDB_GENRES.ADVENTURE, TMDB_GENRES.FANTASY],
    genreNames: ['Adventure', 'Fantasy'],
    color: '#3B82F6', // Blue / Ocean
    icon: 'Compass',
  },
];

/**
 * Normalizes movie genres to a consistent array of IDs and Names.
 */
export function extractMovieGenres(movie) {
  if (!movie) return { ids: [], names: [], hasData: false };

  const ids = new Set();
  const names = new Set();

  if (Array.isArray(movie.genre_ids)) {
    movie.genre_ids.forEach((id) => {
      const numId = Number(id);
      ids.add(numId);
      if (GENRE_ID_TO_NAME[numId]) names.add(GENRE_ID_TO_NAME[numId]);
    });
  }

  if (Array.isArray(movie.genres)) {
    movie.genres.forEach((g) => {
      if (typeof g === 'object' && g !== null) {
        if (g.id) {
          const numId = Number(g.id);
          ids.add(numId);
          if (g.name) names.add(g.name);
          else if (GENRE_ID_TO_NAME[numId]) names.add(GENRE_ID_TO_NAME[numId]);
        } else if (g.name) {
          names.add(g.name);
        }
      } else if (typeof g === 'string') {
        names.add(g);
      } else if (typeof g === 'number') {
        ids.add(g);
        if (GENRE_ID_TO_NAME[g]) names.add(GENRE_ID_TO_NAME[g]);
      }
    });
  }

  const hasData = ids.size > 0 || names.size > 0;
  return {
    ids: Array.from(ids),
    names: Array.from(names),
    hasData,
  };
}

/**
 * Checks if a movie matches a specific mood and provides explainability.
 * @param {Object} movie - Movie object
 * @param {string} moodId - e.g. 'mind-bending', 'feel-good'
 * @returns {Object} { matched: boolean, reason: string, mood: string, moodId: string, matchedGenres: string[] }
 */
export function evaluateMovieMood(movie, moodId) {
  const normalizedMoodId = String(moodId || '').toLowerCase().trim();
  const moodDef = MOOD_DEFINITIONS.find(
    (m) => m.id === normalizedMoodId || m.label.toLowerCase() === normalizedMoodId
  );

  if (!moodDef) {
    return {
      matched: false,
      reason: `Unknown mood "${moodId}"`,
      mood: moodId,
      moodId: normalizedMoodId,
      matchedGenres: [],
      available: false,
    };
  }

  const { ids, names, hasData } = extractMovieGenres(movie);

  if (!hasData) {
    return {
      matched: false,
      reason: 'Mood match unavailable: movie lacks genre metadata',
      mood: moodDef.label,
      moodId: moodDef.id,
      matchedGenres: [],
      available: false,
    };
  }

  const matchedGenres = [];

  // Check ID overlap
  moodDef.genreIds.forEach((genreId) => {
    if (ids.includes(genreId)) {
      matchedGenres.push(GENRE_ID_TO_NAME[genreId]);
    }
  });

  // Check Name overlap in case names exist but IDs didn't match
  moodDef.genreNames.forEach((genreName) => {
    if (
      names.some((n) => n.toLowerCase() === genreName.toLowerCase()) &&
      !matchedGenres.includes(genreName)
    ) {
      matchedGenres.push(genreName);
    }
  });

  const matched = matchedGenres.length > 0;
  let reason = '';

  if (matched) {
    const genreListStr = matchedGenres.join(' and ');
    reason = `Tagged ${moodDef.label.toLowerCase()} because it has ${genreListStr} genre metadata.`;
  } else {
    reason = `Does not match ${moodDef.label.toLowerCase()} (requires ${moodDef.genreNames.join(', ')} genre metadata).`;
  }

  return {
    matched,
    reason,
    mood: moodDef.label,
    moodId: moodDef.id,
    color: moodDef.color,
    matchedGenres,
    available: true,
  };
}

/**
 * Derives all matching mood tags for a movie with explainable reasons.
 * @param {Object} movie 
 * @returns {Array} Array of mood tag objects
 */
export function deriveMovieMoods(movie) {
  const { hasData } = extractMovieGenres(movie);
  if (!hasData) {
    return [
      {
        moodId: 'unavailable',
        mood: 'Mood match unavailable',
        reason: 'Genre metadata is missing for this title',
        color: '#6B7280',
        available: false,
      },
    ];
  }

  const matchingMoods = [];

  for (const moodDef of MOOD_DEFINITIONS) {
    const result = evaluateMovieMood(movie, moodDef.id);
    if (result.matched) {
      matchingMoods.push({
        moodId: moodDef.id,
        mood: moodDef.label,
        reason: result.reason,
        color: moodDef.color,
        matchedGenres: result.matchedGenres,
        available: true,
      });
    }
  }

  return matchingMoods;
}

/**
 * Enriches a movie object with derived mood tags and formatted genres.
 */
export function enrichMovieWithMoods(movie) {
  if (!movie) return null;
  const genresInfo = extractMovieGenres(movie);
  const derivedMoods = deriveMovieMoods(movie);

  return {
    ...movie,
    genre_names: genresInfo.names,
    moods: derivedMoods,
    primary_mood: derivedMoods.length > 0 && derivedMoods[0].available ? derivedMoods[0] : null,
  };
}
