# Movie Duel: Mood-Based Movie Discovery and Comparison

> **Find the film that fits your mood.**  
> Built as an End-Term Software Project by **Mohammed Zohaib**  
> Submission Deadline: **27 October 2026, 11:59 PM IST**  
> Official Submission Form: [Google Forms](https://forms.gle/sBy4sfqyiRG2Zpom9)

---

## 1. Problem Statement & Target Users

### The Problem
When viewers sit down to watch a film, they almost always have a specific feeling or atmosphere in mind (e.g. *mind-bending*, *feel-good*, *dark & intense*). Browsing broad genre catalogs returns hundreds of unrelated titles, and deciding between two potential choices often leads to choice paralysis and endless debate.

### The Target Users
Casual film viewers, movie enthusiasts, and pairs/groups looking to quickly discover films matching how they feel and settle comparisons through transparent, explainable criteria.

### The Solution
**Movie Duel** solves this by:
1. Deriving **8 explainable mood tags** directly from authentic TMDB metadata and genre signals.
2. Providing a **Movie Duel Arena** that pits two distinct titles against each other using a deterministic, transparent weighted algorithm (accounting for mood fit, genre preferences, rating, and runtime).
3. Implementing **mood-aware recommendations** that explicitly explain *why* each title fits the user's taste.
4. Offering a **persistent watchlist** with duplicate prevention, user ownership, and instant duel shortcuts.

---

## 2. Core Workflows (P0 Requirements)

### 1. Mood-Based Discovery & Search
- Real-time catalog of popular, trending, and award-winning films.
- Interactive mood chips for the 8 derived moods.
- Every movie card displays derived mood badges with a hover tooltip explaining the exact metadata rule that triggered the tag (e.g., *"Tagged adventurous because it has Adventure and Fantasy genre metadata"*).
- Instant global live search with debounced autocomplete dropdown.

### 2. Movie Duel Arena
- Side-by-side comparison between two distinct titles.
- Target mood selector and customizable criteria weights (Mood match, User genre preference, TMDB rating, Runtime fit).
- Fully deterministic calculation with clear breakdown bars for each criterion.
- Documented **Tie Threshold (< 3.0 points difference)**: Declares *"Too close to call (Tie)"* rather than exaggerating a trivial difference.
- Clear rejection of invalid operations: rejecting same-movie duels and negative weights.
- Transparent missing-data handling: omits unavailable criteria, re-normalizes remaining weights to 100%, or returns an *"Inconclusive"* verdict if shared data is insufficient.

### 3. Persistent Watchlist
- Authenticated user library backed by MongoDB Atlas / Mongoose (with a zero-config in-memory fallback mode for local offline evaluation).
- Enforces strict one-item-per-movie user uniqueness.
- Filter saved films by derived mood tags.
- One-click shortcut to launch any saved film into the Duel Arena.

### 4. Mood-Aware Recommendations
- Deterministic ranking engine evaluating candidates against the user's active mood and genre preferences.
- Every recommendation card displays a human-readable reason (e.g., *"Matches your suspenseful mood through Thriller genre metadata and aligns with your Sci-Fi preference"*).
- Interactive preferences modal allowing instant tuning of moods, favorite genres, and target runtime.

---

## 3. Mood Engine: Transparent Rule Table

Movie Duel does **not** treat moods as a black box. Moods are derived through explicit, documented rule mappings over TMDB genre IDs and metadata:

| Mood Tag | Derived Rule & TMDB Genre Metadata Clues | Explainability Reason Example |
|---|---|---|
| **Mind-bending** | Science Fiction (`878`) or Mystery (`9648`) | *"Tagged mind-bending because it has Science Fiction genre metadata."* |
| **Feel-good** | Comedy (`35`), Family (`10751`), or Animation (`16`) | *"Tagged feel-good because it has Comedy and Animation genre metadata."* |
| **Dark and intense** | Thriller (`53`), Crime (`80`), or Horror (`27`) | *"Tagged dark and intense because it has Thriller and Crime genre metadata."* |
| **Emotional** | Drama (`18`) or Romance (`10749`) | *"Tagged emotional because it has Drama genre metadata."* |
| **Uplifting** | Family (`10751`), Animation (`16`), or Music (`10402`) | *"Tagged uplifting because it has Family and Music genre metadata."* |
| **Cozy** | Family (`10751`), Animation (`16`), or Romance (`10749`) | *"Tagged cozy because it has Animation and Family genre metadata."* |
| **Suspenseful** | Thriller (`53`), Mystery (`9648`), or Crime (`80`) | *"Tagged suspenseful because it has Mystery and Thriller genre metadata."* |
| **Adventurous** | Adventure (`12`) or Fantasy (`14`) | *"Tagged adventurous because it has Adventure and Fantasy genre metadata."* |

*Note: If metadata is absent, the label is omitted and displays "Mood match unavailable" rather than fabricating data.*

---

## 4. Duel Scoring Algorithm

For any two movies $M_1$ and $M_2$, the backend evaluates available criteria:

$$\text{Score}(M) = \sum_{i \in \text{Available}} \left( \hat{w}_i \times C_i(M) \right)$$

Where:
- $C_{\text{mood}}(M) \in \{0, 100\}$: $100$ if $M$ matches the target mood, $0$ if not.
- $C_{\text{genre}}(M) \in [0, 100]$: Overlap ratio of user favorite genres present in $M$.
- $C_{\text{rating}}(M) \in [0, 100]$: Normalized TMDB rating $\frac{\text{vote\_average}}{10} \times 100$.
- $C_{\text{runtime}}(M) \in [0, 100]$: Closeness to target runtime $\max\left(0, 100 - \frac{|\text{runtime} - T|}{T} \times 100\right)$.
- $\hat{w}_i = \frac{w_i}{\sum_{j \in \text{Available}} w_j}$: Normalized weights summing strictly to $1.0$.

### Tie and Missing Data Rules
- **Tie Threshold:** If $|\text{Score}(M_1) - \text{Score}(M_2)| < 3.0$, the result is declared **"Too close to call (Tie)"**.
- **Excluded Criteria:** If a criterion is missing for either movie, it is omitted from both, and remaining weights are renormalized.
- **Inconclusive:** If fewer than 1 shared criteria remain, an **"Inconclusive Outcome"** is returned.

---

## 5. Technology Stack & Architecture

```text
[ Browser / React + Vite + Tailwind CSS ]
                  │
                  ▼ (REST JSON API with JWT Auth)
[ Node.js + Express Backend ]
   ├── Services
   │    ├── moodEngine.js (Rule heuristic classifier)
   │    ├── duelEngine.js (Deterministic weighted comparison)
   │    ├── recommendationEngine.js (Explainable content matching)
   │    └── tmdbService.js (Live TMDB proxy + Fallback catalog)
   ├── Storage Layer
   │    └── storageService.js (Mongoose Models / Resilient Memory Fallback)
   └── Database
        └── MongoDB Atlas (Users, Passwords [Bcrypt], Watchlist, Preferences)
```

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, React Router.
- **Backend:** Node.js, Express, Mongoose, JWT, Bcrypt.js, CORS.
- **Data Provider:** TMDB (The Movie Database) API with an offline fallback catalog of 40+ curated films.

---

## 6. Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node v22.19.0)
- npm v9+

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd Movie_Comp

# Install root dependencies
npm install

# Install client and server dependencies
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside `server/`:
```bash
cp server/.env.example server/.env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB Atlas or local connection URI | `mongodb://localhost:27017/movie_duel` *(auto-falls back to resilient memory mode if offline)* |
| `JWT_SECRET` | Secret key for signing session tokens | `movie_duel_jwt_dev_secret_key_2026_xyz` |
| `TMDB_API_KEY` | *(Optional)* Your TMDB v3 API Key | *(Leave blank to use preloaded authentic catalog)* |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |

### 3. Run the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```
Or start them individually:
```bash
# Terminal 1: Backend API (port 5000)
npm run server

# Terminal 2: Vite Frontend (port 5173)
npm run client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Running Tests

The backend test suite uses Node's native test runner (`node:test`) and covers mood heuristics, duel weights, ties, same-movie rejection, and edge cases:

```bash
npm test
```
*Expected result:* **14 / 14 tests passing.**

---

## 8. Final Submission Metadata

```text
Project Name: Movie Duel: Mood-Based Movie Discovery and Comparison
Student Name: Mohammed Zohaib
Problem Statement: Viewers struggle to discover films fitting their current emotional mood and lack transparent, explainable tools to compare options without bias.
GitHub Repository: https://github.com/Mohammed-Zohaib1/Movie_Comp
Deployed Application / Build: Available via local run / Vercel + Render
Demo Video: 3-5 minute demo recording
Tech Stack: React, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, Mongoose, TMDB API
Major Features:
  1. 8 rule-derived explainable mood tags
  2. Side-by-side deterministic Movie Duel with tie threshold
  3. Persistent user watchlist with uniqueness guarantees
  4. Mood-aware explainable recommendation ranking
```

---

## 9. TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Film metadata, titles, artwork, and descriptions are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
