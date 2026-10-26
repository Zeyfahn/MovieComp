import express from 'express';
import { movieController } from '../controllers/movieController.js';
import { duelController } from '../controllers/duelController.js';
import { watchlistController } from '../controllers/watchlistController.js';
import { recommendationController } from '../controllers/recommendationController.js';
import { authController } from '../controllers/authController.js';
import { authRequired, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Movies (Public)
router.get('/movies/moods', movieController.getMoods);
router.get('/movies/trending', movieController.getTrending);
router.get('/movies/search', movieController.search);
router.get('/movies/discover', movieController.discover);
router.get('/movies/:id', movieController.getDetails);

// Duel Engine (Public or Authenticated)
router.post('/duels/compare', optionalAuth, duelController.compare);

// Recommendations (Public Fallback or Authenticated)
router.get('/recommendations', optionalAuth, recommendationController.getRecommendations);

// Watchlist (Authenticated)
router.get('/watchlist', authRequired, watchlistController.getWatchlist);
router.post('/watchlist', authRequired, watchlistController.add);
router.delete('/watchlist/:movieId', authRequired, watchlistController.remove);

// Auth & User Preferences
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authRequired, authController.getMe);
router.get('/preferences', authRequired, authController.getMe);
router.put('/preferences', authRequired, authController.updatePreferences);

export default router;
