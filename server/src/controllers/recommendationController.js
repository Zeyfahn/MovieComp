import { getTrendingMovies } from '../services/tmdbService.js';
import { rankRecommendations } from '../services/recommendationEngine.js';
import { storageService } from '../services/storageService.js';

export const recommendationController = {
  async getRecommendations(req, res) {
    try {
      let moods = [];
      let favoriteGenres = [];
      let targetRuntime = null;

      // Check authenticated user preferences
      if (req.user) {
        const user = await storageService.findUserById(req.user.id);
        if (user && user.preferences) {
          moods = user.preferences.moods || [];
          favoriteGenres = user.preferences.favoriteGenres || [];
          targetRuntime = user.preferences.targetRuntime || null;
        }
      }

      // Allow query overrides e.g. /api/recommendations?moods=mind-bending,cozy
      if (req.query.moods) {
        moods = req.query.moods.split(',').map((s) => s.trim());
      }
      if (req.query.genres) {
        favoriteGenres = req.query.genres.split(',').map((s) => s.trim());
      }
      if (req.query.runtime) {
        targetRuntime = Number(req.query.runtime);
      }

      const limit = Number(req.query.limit) || 10;
      const candidateMovies = await getTrendingMovies();

      const ranked = rankRecommendations(
        candidateMovies,
        { moods, favoriteGenres, targetRuntime },
        limit
      );

      return res.json({
        success: true,
        count: ranked.length,
        preferencesUsed: {
          moods,
          favoriteGenres,
          targetRuntime,
          isPersonalized: moods.length > 0 || favoriteGenres.length > 0,
        },
        recommendations: ranked,
      });
    } catch (err) {
      console.error('Recommendations error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to generate recommendations at this time.',
      });
    }
  },
};
