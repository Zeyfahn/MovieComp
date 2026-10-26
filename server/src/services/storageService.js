import { User } from '../models/User.js';
import { Watchlist } from '../models/Watchlist.js';
import { isDbConnected } from '../config/db.js';

// Resilient In-Memory Storage for when MongoDB is not running locally
const memoryUsers = new Map();
const memoryWatchlist = [];
let memIdCounter = 1000;

export const storageService = {
  // USER METHODS
  async createUser(userData) {
    if (isDbConnected()) {
      const user = new User(userData);
      return await user.save();
    }

    // Memory Mode
    const id = `mem_user_${++memIdCounter}`;
    const newUser = {
      _id: id,
      id,
      name: userData.name || 'Film Buff',
      email: userData.email.toLowerCase(),
      password: userData.password,
      preferences: userData.preferences || {
        moods: ['mind-bending', 'dark-and-intense'],
        favoriteGenres: ['Science Fiction', 'Thriller'],
        targetRuntime: 120,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(id, newUser);
    return newUser;
  },

  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      return await User.findOne({ email: cleanEmail });
    }

    for (const user of memoryUsers.values()) {
      if (user.email === cleanEmail) return user;
    }
    return null;
  },

  async findUserById(id) {
    if (!id) return null;

    if (isDbConnected()) {
      return await User.findById(id).select('-password');
    }

    const user = memoryUsers.get(String(id));
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async updateUserPreferences(id, preferences) {
    if (isDbConnected()) {
      const user = await User.findById(id);
      if (!user) return null;
      user.preferences = { ...user.preferences, ...preferences };
      await user.save();
      return user.preferences;
    }

    const user = memoryUsers.get(String(id));
    if (!user) return null;
    user.preferences = { ...user.preferences, ...preferences };
    user.updatedAt = new Date();
    return user.preferences;
  },

  // WATCHLIST METHODS
  async getWatchlistByUser(userId) {
    if (isDbConnected()) {
      return await Watchlist.find({ userId }).sort({ savedAt: -1 });
    }

    return memoryWatchlist
      .filter((item) => String(item.userId) === String(userId))
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  },

  async addToWatchlist(userId, movieData) {
    const movieId = Number(movieData.movieId || movieData.id);

    if (isDbConnected()) {
      // Check existing to enforce one item per user/movie
      const existing = await Watchlist.findOne({ userId, movieId });
      if (existing) {
        return { item: existing, alreadySaved: true };
      }

      const item = new Watchlist({
        userId,
        movieId,
        title: movieData.title,
        poster_path: movieData.poster_path || movieData.poster_url,
        release_date: movieData.release_date,
        vote_average: movieData.vote_average,
        primary_mood: movieData.primary_mood || null,
        savedAt: new Date(),
      });
      await item.save();
      return { item, alreadySaved: false };
    }

    // Memory Mode
    const existingIndex = memoryWatchlist.findIndex(
      (item) => String(item.userId) === String(userId) && item.movieId === movieId
    );

    if (existingIndex !== -1) {
      return { item: memoryWatchlist[existingIndex], alreadySaved: true };
    }

    const item = {
      _id: `mem_wl_${++memIdCounter}`,
      id: `mem_wl_${memIdCounter}`,
      userId,
      movieId,
      title: movieData.title,
      poster_path: movieData.poster_path || movieData.poster_url,
      release_date: movieData.release_date,
      vote_average: movieData.vote_average,
      primary_mood: movieData.primary_mood || null,
      savedAt: new Date(),
    };
    memoryWatchlist.push(item);
    return { item, alreadySaved: false };
  },

  async removeFromWatchlist(userId, movieId) {
    const numMovieId = Number(movieId);

    if (isDbConnected()) {
      const res = await Watchlist.findOneAndDelete({ userId, movieId: numMovieId });
      return !!res;
    }

    const index = memoryWatchlist.findIndex(
      (item) => String(item.userId) === String(userId) && item.movieId === numMovieId
    );
    if (index !== -1) {
      memoryWatchlist.splice(index, 1);
      return true;
    }
    return false;
  },

  async isMovieInWatchlist(userId, movieId) {
    const numMovieId = Number(movieId);
    if (isDbConnected()) {
      const exists = await Watchlist.exists({ userId, movieId: numMovieId });
      return !!exists;
    }
    return memoryWatchlist.some(
      (item) => String(item.userId) === String(userId) && item.movieId === numMovieId
    );
  },
};
