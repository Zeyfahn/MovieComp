import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storageService } from '../services/storageService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'movie_duel_jwt_dev_secret_key_2026_xyz';

function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const authController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide both email and password.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.',
        });
      }

      const existing = await storageService.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await storageService.createUser({
        email,
        password: hashedPassword,
        name: name || 'Movie Enthusiast',
        preferences: {
          moods: ['mind-bending', 'dark-and-intense'],
          favoriteGenres: ['Science Fiction', 'Thriller'],
          targetRuntime: 120,
        },
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id || user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({
        success: false,
        error: 'Registration failed due to a server error. Please try again.',
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide both email and password.',
        });
      }

      const user = await storageService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id || user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        error: 'Login failed due to a server error. Please try again.',
      });
    }
  },

  async getMe(req, res) {
    try {
      const user = await storageService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      return res.json({
        success: true,
        user: {
          id: user._id || user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
    }
  },

  async updatePreferences(req, res) {
    try {
      const { moods, favoriteGenres, targetRuntime } = req.body;

      const updated = await storageService.updateUserPreferences(req.user.id, {
        ...(moods && { moods }),
        ...(favoriteGenres && { favoriteGenres }),
        ...(targetRuntime !== undefined && { targetRuntime: Number(targetRuntime) }),
      });

      return res.json({
        success: true,
        message: 'Preferences updated successfully.',
        preferences: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to update preferences.' });
    }
  },
};
