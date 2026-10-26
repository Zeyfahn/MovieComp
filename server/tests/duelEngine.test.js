import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMovieDuel,
  validateWeights,
  TIE_THRESHOLD,
} from '../src/services/duelEngine.js';

test('Duel Engine - Comparison & Scoring Rules', async (t) => {
  const interstellar = {
    id: 157336,
    title: 'Interstellar',
    genre_ids: [12, 18, 878], // Adventure, Drama, Sci-Fi
    vote_average: 8.4,
    vote_count: 36000,
    runtime: 169,
  };

  const soul = {
    id: 508442,
    title: 'Soul',
    genre_ids: [16, 35, 10751, 14], // Animation, Comedy, Family, Fantasy
    vote_average: 8.1,
    vote_count: 10200,
    runtime: 100,
  };

  await t.test('rejects comparison of the same movie with itself', () => {
    assert.throws(
      () => {
        calculateMovieDuel({
          movie1: interstellar,
          movie2: interstellar,
          moodId: 'mind-bending',
        });
      },
      {
        message: /Cannot duel a movie with itself/,
      }
    );
  });

  await t.test('rejects negative weights', () => {
    const check = validateWeights({ mood_match: -0.5, tmdb_rating: 1.0 });
    assert.equal(check.valid, false);
    assert.match(check.message, /must be a non-negative number/);
  });

  await t.test('correctly awards winner when one film matches target mood', () => {
    // Interstellar has Sci-Fi -> matches mind-bending
    // Soul has Animation, Comedy, Family, Fantasy -> does NOT match mind-bending
    const result = calculateMovieDuel({
      movie1: interstellar,
      movie2: soul,
      moodId: 'mind-bending',
      userPreferredGenres: ['Science Fiction'],
    });

    assert.equal(result.status, 'success');
    assert.equal(result.outcomeType, 'winner');
    assert.equal(result.winnerId, interstellar.id);
    assert.ok(result.movie1.totalScore > result.movie2.totalScore);
    assert.match(result.verdict, /Interstellar is the stronger match/);
  });

  await t.test('declares "Too close to call" (Tie) when score difference < 3.0', () => {
    // Compare two movies with very similar profiles
    const movieA = {
      id: 101,
      title: 'Movie Alpha',
      genre_ids: [878],
      vote_average: 8.0,
      vote_count: 1000,
      runtime: 120,
    };
    const movieB = {
      id: 102,
      title: 'Movie Beta',
      genre_ids: [878],
      vote_average: 8.1,
      vote_count: 1000,
      runtime: 120,
    };

    const result = calculateMovieDuel({
      movie1: movieA,
      movie2: movieB,
      moodId: 'mind-bending',
    });

    assert.equal(result.status, 'success');
    assert.equal(result.outcomeType, 'tie');
    assert.equal(result.isTie, true);
    assert.match(result.verdict, /Too close to call/);
    assert.ok(result.scoreDifference < TIE_THRESHOLD);
  });

  await t.test('renormalizes weights when a criterion is missing', () => {
    // movieNoRuntime has no runtime -> runtime_fit should be excluded
    const movieNoRuntime = {
      id: 201,
      title: 'Short Film',
      genre_ids: [18],
      vote_average: 7.5,
      vote_count: 50,
      runtime: null,
    };
    const movieWithRuntime = {
      id: 202,
      title: 'Feature Film',
      genre_ids: [18],
      vote_average: 7.6,
      vote_count: 50,
      runtime: 90,
    };

    const result = calculateMovieDuel({
      movie1: movieNoRuntime,
      movie2: movieWithRuntime,
      moodId: 'emotional',
      targetRuntime: 90,
    });

    assert.equal(result.status, 'success');
    assert.ok(!result.availableCriteria.includes('runtime_fit'));
    // Sum of normalized weights should equal 1.0
    const sumWeights = Object.values(result.normalizedWeights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sumWeights - 1.0) < 0.001);
  });

  await t.test('returns inconclusive when no shared criteria can be evaluated', () => {
    const blank1 = { id: 301, title: 'Blank 1', genre_ids: [], vote_count: 0 };
    const blank2 = { id: 302, title: 'Blank 2', genre_ids: [], vote_count: 0 };

    const result = calculateMovieDuel({
      movie1: blank1,
      movie2: blank2,
      moodId: 'mind-bending',
    });

    assert.equal(result.status, 'inconclusive');
    assert.match(result.verdict, /Insufficient shared metadata/);
  });
});
