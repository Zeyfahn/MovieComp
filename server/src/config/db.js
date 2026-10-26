import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_duel';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local/atlas is down
    });
    isConnected = true;
    console.log(`✅ Connected to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err) {
    console.warn(`⚠️  MongoDB connection error: ${err.message}`);
    console.warn('ℹ️  Running in Resilient Memory Mode for Users and Watchlist storage.');
    isConnected = false;
  }
}

export function isDbConnected() {
  return isConnected;
}
