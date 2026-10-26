import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Film Buff',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    preferences: {
      moods: {
        type: [String],
        default: ['mind-bending', 'dark-and-intense'],
      },
      favoriteGenres: {
        type: [String],
        default: ['Science Fiction', 'Thriller'],
      },
      targetRuntime: {
        type: Number,
        default: 120,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
