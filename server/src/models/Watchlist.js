import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movieId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster_path: {
      type: String,
    },
    release_date: {
      type: String,
    },
    vote_average: {
      type: Number,
    },
    primary_mood: {
      type: Object,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one item per user/movie (PRD Section 8)
watchlistItemSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Watchlist = mongoose.model('Watchlist', watchlistItemSchema);
