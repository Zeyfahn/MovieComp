import {
  getTrendingMovies,
  searchMovies,
  getMovieById,
  discoverMoviesByMood,
} from '../services/tmdbService.js';
import { MOOD_DEFINITIONS } from '../services/moodEngine.js';

export const movieController = {
  // GET /api/movies/moods
  async getMoods(req, res) {
    return res.json({
      success: true,
      moods: MOOD_DEFINITIONS.map((m) => ({
        id: m.id,
        label: m.label,
        description: m.description,
        genreNames: m.genreNames,
        color: m.color,
        icon: m.icon,
      })),
    });
  },

  // GET /api/movies/trending
  async getTrending(req, res) {
    try {
      const movies = await getTrendingMovies();
      return res.json({
        success: true,
        count: movies.length,
        movies,
      });
    } catch (err) {
      console.error('Error fetching trending movies:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to retrieve trending movies at this moment. Please try again.',
      });
    }
  },

  // GET /api/movies/search?q=
  async search(req, res) {
    try {
      const { q } = req.query;

      // PRD Section 10: empty search prompt
      if (!q || !q.trim()) {
        return res.json({
          success: true,
          count: 0,
          movies: [],
          message: 'Please enter a search term to find movies.',
        });
      }

      const movies = await searchMovies(q);
      return res.json({
        success: true,
        count: movies.length,
        query: q.trim(),
        movies,
      });
    } catch (err) {
      console.error('Search error:', err);
      return res.status(500).json({
        success: false,
        error: 'Search operation failed. Please check your query or try again later.',
      });
    }
  },

  // GET /api/movies/discover?mood=
  async discover(req, res) {
    try {
      const { mood } = req.query;

      if (!mood) {
        const all = await getTrendingMovies();
        return res.json({
          success: true,
          mood: null,
          count: all.length,
          movies: all,
        });
      }

      const movies = await discoverMoviesByMood(mood);
      return res.json({
        success: true,
        mood,
        count: movies.length,
        movies,
      });
    } catch (err) {
      console.error('Discover error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to discover movies for the requested mood.',
      });
    }
  },

  // GET /api/movies/:id
  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const movie = await getMovieById(id);

      if (!movie) {
        return res.status(404).json({
          success: false,
          error: `Movie with ID "${id}" was not found.`,
        });
      }

      return res.json({
        success: true,
        movie,
      });
    } catch (err) {
      console.error('Get movie details error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to load movie details. Please try again.',
      });
    }
  },
};
