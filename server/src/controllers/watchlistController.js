import { storageService } from '../services/storageService.js';
import { getMovieById } from '../services/tmdbService.js';

export const watchlistController = {
  // GET /api/watchlist
  async getWatchlist(req, res) {
    try {
      const items = await storageService.getWatchlistByUser(req.user.id);
      return res.json({
        success: true,
        count: items.length,
        watchlist: items,
      });
    } catch (err) {
      console.error('Get watchlist error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve your watchlist. Please try again.',
      });
    }
  },

  // POST /api/watchlist
  async add(req, res) {
    try {
      const { movieId, movie } = req.body;
      const targetMovieId = movieId || (movie && movie.id);

      if (!targetMovieId) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid movieId to save.',
        });
      }

      let movieData = movie;
      if (!movieData) {
        movieData = await getMovieById(targetMovieId);
      }

      if (!movieData) {
        return res.status(404).json({
          success: false,
          error: `Movie with ID ${targetMovieId} was not found.`,
        });
      }

      const { item, alreadySaved } = await storageService.addToWatchlist(
        req.user.id,
        movieData
      );

      return res.status(alreadySaved ? 200 : 201).json({
        success: true,
        alreadySaved,
        message: alreadySaved
          ? `"${movieData.title}" is already in your watchlist.`
          : `Saved "${movieData.title}" to your watchlist!`,
        item,
      });
    } catch (err) {
      console.error('Add to watchlist error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to add movie to watchlist.',
      });
    }
  },

  // DELETE /api/watchlist/:movieId
  async remove(req, res) {
    try {
      const { movieId } = req.params;
      if (!movieId) {
        return res.status(400).json({
          success: false,
          error: 'Missing movieId parameter.',
        });
      }

      const removed = await storageService.removeFromWatchlist(
        req.user.id,
        movieId
      );

      return res.json({
        success: true,
        removed,
        message: removed
          ? 'Movie removed from watchlist.'
          : 'Movie was not in your watchlist.',
      });
    } catch (err) {
      console.error('Remove watchlist error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove movie from watchlist.',
      });
    }
  },
};
