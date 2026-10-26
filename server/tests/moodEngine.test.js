import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMovieMood,
  deriveMovieMoods,
  extractMovieGenres,
  MOOD_DEFINITIONS,
  TMDB_GENRES,
} from '../src/services/moodEngine.js';

test('Mood Engine - Rule Mapping & Overlap', async (t) => {
  await t.test('assigns "mind-bending" to Sci-Fi or Mystery movies', () => {
    const sciFiMovie = {
      title: 'Interstellar',
      genre_ids: [TMDB_GENRES.SCIENCE_FICTION],
    };
    const result = evaluateMovieMood(sciFiMovie, 'mind-bending');
    assert.equal(result.matched, true);
    assert.match(result.reason, /Science Fiction/);
    assert.equal(result.available, true);
  });

  await t.test('assigns "feel-good" to Comedy, Family, or Animation movies', () => {
    const comedyMovie = {
      title: 'Soul',
      genre_ids: [TMDB_GENRES.ANIMATION, TMDB_GENRES.COMEDY],
    };
    const result = evaluateMovieMood(comedyMovie, 'feel-good');
    assert.equal(result.matched, true);
    assert.match(result.reason, /Comedy/);
  });

  await t.test('assigns "dark-and-intense" to Thriller, Crime, or Horror movies', () => {
    const darkMovie = {
      title: 'Se7en',
      genre_ids: [TMDB_GENRES.CRIME, TMDB_GENRES.THRILLER],
    };
    const result = evaluateMovieMood(darkMovie, 'dark-and-intense');
    assert.equal(result.matched, true);
    assert.ok(result.reason.includes('Crime') && result.reason.includes('Thriller'));
  });

  await t.test('allows multiple overlapping moods for a movie', () => {
    // Parasite has Comedy (35), Thriller (53), Drama (18)
    // -> Matches feel-good (Comedy), dark-and-intense (Thriller), emotional (Drama), suspenseful (Thriller)
    const parasite = {
      title: 'Parasite',
      genre_ids: [35, 53, 18],
    };
    const moods = deriveMovieMoods(parasite);
    const moodIds = moods.map((m) => m.moodId);

    assert.ok(moodIds.includes('feel-good'));
    assert.ok(moodIds.includes('dark-and-intense'));
    assert.ok(moodIds.includes('emotional'));
    assert.ok(moodIds.includes('suspenseful'));
  });

  await t.test('handles missing genre metadata gracefully without guessing', () => {
    const blankMovie = {
      title: 'Unknown Title',
      genre_ids: [],
      genres: [],
    };
    const result = evaluateMovieMood(blankMovie, 'mind-bending');
    assert.equal(result.matched, false);
    assert.equal(result.available, false);
    assert.match(result.reason, /lacks genre metadata/);

    const allMoods = deriveMovieMoods(blankMovie);
    assert.equal(allMoods[0].moodId, 'unavailable');
    assert.equal(allMoods[0].available, false);
  });

  await t.test('handles genre names format when IDs are not supplied', () => {
    const namedMovie = {
      title: 'Adventure Film',
      genres: [{ name: 'Adventure' }, { name: 'Fantasy' }],
    };
    const result = evaluateMovieMood(namedMovie, 'adventurous');
    assert.equal(result.matched, true);
    assert.match(result.reason, /Adventure and Fantasy/);
  });
});
