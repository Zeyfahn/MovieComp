import { getMovieById } from '../services/tmdbService.js';
import { calculateMovieDuel, validateWeights } from '../services/duelEngine.js';
import { storageService } from '../services/storageService.js';

export const duelController = {
  async compare(req, res) {
    try {
      const {
        movie1Id,
        movie2Id,
        moodId,
        weights = {},
        userPreferredGenres,
        targetRuntime,
      } = req.body;

      // PRD Section 10: Missing ID validation
      if (!movie1Id || !movie2Id) {
        return res.status(400).json({
          success: false,
          error: 'Please select two movies to initiate a duel comparison.',
        });
      }

      // PRD Section 10: Same movie comparison rejected
      if (String(movie1Id) === String(movie2Id)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot duel a movie with itself. Please select two distinct titles.',
        });
      }

      if (!moodId) {
        return res.status(400).json({
          success: false,
          error: 'Please choose a target mood for the comparison.',
        });
      }

      // Validate custom weights
      const weightCheck = validateWeights(weights);
      if (!weightCheck.valid) {
        return res.status(400).json({
          success: false,
          error: weightCheck.message,
        });
      }

      // Fetch both movies in parallel
      const [movie1, movie2] = await Promise.all([
        getMovieById(movie1Id),
        getMovieById(movie2Id),
      ]);

      if (!movie1) {
        return res.status(404).json({
          success: false,
          error: `First movie (ID: ${movie1Id}) could not be retrieved from TMDB.`,
        });
      }

      if (!movie2) {
        return res.status(404).json({
          success: false,
          error: `Second movie (ID: ${movie2Id}) could not be retrieved from TMDB.`,
        });
      }

      // If user is authenticated and didn't pass explicit preferred genres, use saved preferences
      let preferredGenres = userPreferredGenres;
      let runtimeTarget = targetRuntime;

      if (req.user && (!preferredGenres || preferredGenres.length === 0)) {
        const user = await storageService.findUserById(req.user.id);
        if (user && user.preferences) {
          if (!preferredGenres || preferredGenres.length === 0) {
            preferredGenres = user.preferences.favoriteGenres || [];
          }
          if (runtimeTarget === undefined && user.preferences.targetRuntime) {
            runtimeTarget = user.preferences.targetRuntime;
          }
        }
      }

      const result = calculateMovieDuel({
        movie1,
        movie2,
        moodId,
        userWeights: weights,
        userPreferredGenres: preferredGenres,
        targetRuntime: runtimeTarget ? Number(runtimeTarget) : null,
      });

      return res.json({
        success: true,
        duel: result,
      });
    } catch (err) {
      console.error('Duel calculation error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'An error occurred while calculating the duel.',
      });
    }
  },
};
