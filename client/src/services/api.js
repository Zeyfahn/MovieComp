const API_BASE_URL = 'https://moviecomp.onrender.com/api';


function getAuthHeaders() {
  const token = localStorage.getItem('movie_duel_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Request failed`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Movies
  async getMoods() {
    return await request('/movies/moods');
  },

  async getTrending() {
  return await request('/movies/trending');
  },

  async searchMovies(query) {
    if (!query || !query.trim()) return { success: true, count: 0, movies: [] };
    return await request(`/movies/search?q=${encodeURIComponent(query.trim())}`);
  },

  async discoverByMood(moodId) {
    if (!moodId) return await this.getTrending();
    return await request(`/movies/discover?mood=${encodeURIComponent(moodId)}`);
  },

  async getMovieDetails(id) {
    return await request(`/movies/${id}`);
  },

  // Duel
  async compareMovies(payload) {
    return await request('/duels/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Recommendations
  async getRecommendations(params = {}) {
    const query = new URLSearchParams();
    if (params.moods && params.moods.length > 0) {
      query.set('moods', params.moods.join(','));
    }
    if (params.genres && params.genres.length > 0) {
      query.set('genres', params.genres.join(','));
    }
    if (params.runtime) {
      query.set('runtime', params.runtime);
    }
    const qStr = query.toString();
    return await request(`/recommendations${qStr ? `?${qStr}` : ''}`);
  },

  // Watchlist
  async getWatchlist() {
    return await request('/watchlist');
  },

  async addToWatchlist(movie) {
    return await request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({
        movieId: movie.id,
        movie,
      }),
    });
  },

  async removeFromWatchlist(movieId) {
    return await request(`/watchlist/${movieId}`, {
      method: 'DELETE',
    });
  },

  // Auth & Preferences
  async login(credentials) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(payload) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return await request('/auth/me');
  },

  async updatePreferences(preferences) {
    return await request('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};
