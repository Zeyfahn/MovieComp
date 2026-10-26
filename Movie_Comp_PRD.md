# Movie Duel: Mood-Based Movie Discovery and Comparison

**Version:** 1.1 (revised)  
**Project type:** End-Term Software Project  
**Deadline:** 27 October 2026, 11:59 PM IST  
**Tagline:** Find the film that fits your mood.

## 1. Product Overview

Movie Duel helps people decide what to watch by discovering films for a chosen mood, comparing two titles, and saving films they want to watch later. It keeps the original Movie Duel idea and adds mood-based discovery as its main differentiator.

Users can choose from moods such as **mind-bending, feel-good, dark and intense, emotional, uplifting, cozy, suspenseful,** and **adventurous**. The application assigns these mood tags with transparent rules based on available TMDB genres and metadata. These are Movie Duel's own derived labels; the PRD does not assume TMDB directly supplies these mood tags.

### Problem

People often have a mood in mind but do not know which movie to pick. Browsing by genre alone can return a broad list, and comparing two possibilities does not always make the decision easier.

### Solution

Movie Duel lets users:

1. Explore real movie data and filter it by mood.
2. Search for titles and view movie details.
3. Compare two movies with an explainable score informed by the selected mood and user priorities.
4. Save movies to a persistent watchlist and get recommendations based on preferences.

### Target users

Casual viewers and movie fans who want to find a film for how they feel and make a quick, informed choice between titles.

## 2. Goals and Scope

### MVP goals

- Build a working full-stack application using the stack below.
- Complete four workflows: discovery/search, Movie Duel, watchlist, and recommendations.
- Make mood tags and recommendation/comparison reasons understandable to users.
- Handle missing movie data, API failures, and normal loading and empty states.
- Provide a README, deployed application or accessible build, and a 3–5 minute demo.

### Out of scope

No LLM, trained machine-learning model, social feed, chat, streaming-service integration, or full editorial news system. Duel history, sharing, trailers, and extra homepage sections are optional and should be attempted only after the four workflows work.

**Deadline note:** With submission due 27 October 2026, prioritize a small, complete MVP. If time is limited, finish mood discovery, search/details, Duel, and one reliable persistence/recommendation path before adding optional features. Do not advertise unfinished features as complete.

## 3. Four Core Workflows

### 1. Mood-based discovery and search

1. The user opens the homepage and sees real popular or trending movies.
2. The user selects one or more moods, or searches by title.
3. The application displays matching movies with their mood labels and a short explanation of why each label applies.
4. The user opens details, starts a Duel, or saves a movie.

**Success:** The user can find and inspect real titles and understand why a movie appears for a selected mood.

### 2. Movie Duel

1. The user chooses two different movies.
2. The user selects a mood for the comparison and may adjust the importance of available criteria.
3. The backend calculates a deterministic result from available movie data.
4. The result shows the scores, a winner/tie/inconclusive outcome, and the main reasons.

**Success:** The comparison is repeatable and described as the better match for the selected mood/preferences, not an objectively better film.

### 3. Persistent watchlist

1. The user signs in and saves a movie from discovery, details, or a Duel result.
2. The user opens the watchlist, removes a title if desired, and can return later to see saved items.

**Success:** Each user's list persists and cannot be changed by another user. If authentication cannot be completed in time, use a clearly documented local-only fallback and do not claim cross-device persistence.

### 4. Mood-aware recommendations

1. The user selects moods and favorite genres in preferences.
2. The application retrieves a candidate set from TMDB and ranks it using the same explainable rules.
3. Each result says which selected mood or preference it matches.
4. The user can open or save a recommendation.

**Success:** Changing preferences changes the ranked results or their match explanations. Do not claim that the app learns from behavior.

## 4. Mood Tags and Explainable Rules

TMDB supplies movie metadata such as genre IDs, release date, runtime, synopsis, rating, and popularity when available. Movie Duel derives mood tags from that metadata using a small, explicit rule table. Genres and metadata are clues, not guarantees about how every viewer will feel.

Use a versioned rule map in application code and show a short reason (for example, “Tagged adventurous because it has Adventure genre metadata”). The initial rules are a product heuristic and should be documented as such.

| Mood | Initial rule examples (only when matching metadata exists) |
|---|---|
| Mind-bending | Science Fiction or Mystery genre; a keyword/synopsis clue may be added only if the chosen TMDB endpoint actually supplies it |
| Feel-good | Comedy, Family, or Animation genre; use as a broad heuristic |
| Dark and intense | Thriller, Crime, or Horror genre |
| Emotional | Drama or Romance genre |
| Uplifting | Family, Animation, or Music genre; heuristic, not sentiment analysis |
| Cozy | Family, Animation, or Romance genre; heuristic |
| Suspenseful | Thriller, Mystery, or Crime genre |
| Adventurous | Adventure or Fantasy genre |

Rules can overlap: a movie may receive multiple moods. Apply the same mapping everywhere (homepage, filters, Duel, and recommendations). Avoid unsupported mood claims from popularity, rating, or release date alone. If necessary metadata is missing, omit the affected mood label and show “Mood match unavailable” instead of guessing. Provide a fallback to ordinary genre/popular discovery when no mood-filtered results are available.

## 5. Duel Scoring and Recommendations

### Duel criteria

The MVP may use these criteria when data exists:

- **Mood match:** whether each movie matches the chosen mood under the rule map (matched = 100, not matched = 0; unavailable = missing).
- **Genre preference match:** overlap with genres selected by the user (document the overlap formula).
- **TMDB rating:** normalized to a 0–100 scale, with vote count shown as context.
- **Runtime fit:** included only if the user sets a target runtime; a closer fit scores higher.

Popularity can be displayed but should not silently be treated as quality. Omit criteria that are not available for both movies, then renormalize remaining weights. If too few weighted criteria remain, return an inconclusive result and explain why. Never turn missing values into zero.

For available criteria, calculate a weighted sum:

`score(movie) = sum(normalized_weight × criterion_score)`

Weights must be non-negative and normalize to 1. Use a documented tie threshold (for example, a difference under 3 points) and test it. Show each criterion's score, weight, unavailable fields, and the biggest contributors to the outcome. All numbers and thresholds are configurable implementation decisions and must be stated in the README.

### Recommendation logic

Use deterministic content-based/rule-based ranking, not a trained model. Build candidates from TMDB popular/trending or discover results, score mood and genre matches, and use rating/popularity only as documented tie-breakers. Return concise reasons tied to actual metadata, such as “Matches your suspenseful mood through Thriller genre metadata.” Provide a general popular fallback for anonymous users or users with no saved preferences.

## 6. Functional Requirements

**P0 = required for the MVP. P1 = optional if all P0 work is complete.**

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Show real popular/trending movie data from TMDB | P0 |
| FR-02 | Search movies by title and open a details view | P0 |
| FR-03 | Let users select mood tags and filter discovery results | P0 |
| FR-04 | Display derived mood tags with a short, rule-based explanation | P0 |
| FR-05 | Select two distinct movies and calculate an explainable Duel result | P0 |
| FR-06 | Handle missing comparison data and close scores clearly | P0 |
| FR-07 | Save and remove watchlist items with user ownership where authentication is implemented | P0 |
| FR-08 | Rank recommendations from mood/genre preferences with explanations | P0 |
| FR-09 | Show loading, empty, success, and error states for core workflows | P0 |
| FR-10 | Support optional Duel sharing/history, trailers, or extended sections | P1 |

## 7. Homepage and UI

Keep the existing cinematic, dark-first design direction, with readable contrast and restrained animation. The main page should make mood choice the first discovery action.

Suggested homepage order:

1. Short hero message and title search.
2. Selectable mood chips for the eight moods.
3. “Movies for this mood” results with posters, title, year, available rating, and mood reason.
4. Popular/trending fallback or section.
5. Recommendations for the user's selected moods/preferences.
6. A clear “Start a Duel” action.

Movie cards should link to details and offer Duel/watchlist actions. The Duel result should show both posters/titles, selected mood, criteria breakdown, final outcome, and a brief explanation. Keep responsive layout, keyboard support, visible focus, image alt text, and loading/empty/error states. Do not add editorial news or fabricated social-interest counts.

## 8. Technology and Architecture

Keep the agreed stack:

- **Frontend:** React, Vite, Tailwind CSS, React Router.
- **Backend:** Node.js and Express.
- **Database:** MongoDB Atlas with Mongoose.
- **Movie data:** TMDB API.
- **Deployment:** Frontend and backend hosting such as Vercel and Render, with MongoDB Atlas.

The React client calls the Express JSON API. The backend validates requests, calls TMDB, derives mood tags, calculates Duel/recommendation results, and handles user-specific persistence. Keep TMDB credentials and database secrets on the server. Never commit secrets or expose privileged values in `VITE_` variables.

### Simple data model

- **User:** email, password hash (if password auth is implemented), preferences (moods, favorite genres, optional runtime target), timestamps.
- **Watchlist item:** user ID, TMDB movie ID, minimal display snapshot, saved timestamp. Enforce one item per user/movie.
- **Movie data:** fetch from TMDB; cache only if useful and permitted by TMDB terms.

## 9. API Design

Use consistent JSON responses, input validation, safe errors, and appropriate status codes. Exact route names may follow the implementation.

| Method and route | Purpose | Access |
|---|---|---|
| `GET /api/movies/trending` | Popular/trending movies | Public |
| `GET /api/movies/search?q=` | Search movies | Public |
| `GET /api/movies/:id` | Movie details and available metadata | Public |
| `GET /api/movies/discover?mood=` | Filter/rank candidate movies with derived mood labels and reasons | Public |
| `POST /api/duels/compare` | Validate two movie IDs, mood, and optional weights; return scores and explanation | Public or authenticated |
| `GET /api/recommendations` | Mood/genre preference recommendations | Public fallback or authenticated preferences |
| `GET /api/watchlist` | Read the current user's list | Authenticated |
| `POST /api/watchlist` | Save a movie | Authenticated |
| `DELETE /api/watchlist/:movieId` | Remove a saved movie | Authenticated |
| `GET/PUT /api/preferences` | Read/update mood and genre preferences | Authenticated |

Handle TMDB timeouts/rate limits, invalid IDs, same-movie comparisons, invalid weights, and database errors. Never trust a client-supplied user ID as authorization.

## 10. Missing Data and Error Behavior

- Empty search: do not call TMDB unnecessarily; show a helpful prompt.
- No search/mood results: show a useful empty state and allow changing the query or mood.
- TMDB failure: show a recoverable message and retry option; do not present stale or fabricated data as current.
- Missing metadata: omit the affected criterion/tag, say what is unavailable, and renormalize only where enough comparable data remains.
- Same movie selected twice: reject with a clear message.
- Close scores: show “Too close to call.”
- Unauthenticated watchlist/preferences: prompt sign-in; preserve the user's immediate intent if practical.
- Duplicate watchlist item: keep one item and return a clear success/already-saved state.

## 11. Testing Requirements

Test the critical logic and workflows (automated tests where practical, plus manual end-to-end checks):

- Mood rules assign the expected tags from representative genre metadata, allow overlap, and omit tags when required data is missing.
- Mood filter and recommendation explanations agree with the actual rule matches.
- Duel weights normalize; negative/invalid values are rejected; same IDs are rejected.
- Rating/runtime/genre normalization follows documented rules.
- Missing criteria are excluded and remaining weights renormalized; too little data returns inconclusive.
- Clear winner and close-score cases return the correct verdict and explanation.
- TMDB failure, empty results, invalid movie IDs, and API validation errors are handled.
- Watchlist duplicate and ownership behavior works if authentication/persistence is implemented.
- Manually complete all four core workflows locally and on the deployed app.

## 12. README and Submission

The repository README should include:

- Project name, problem, target users, and solution.
- Mood-based differentiator and the mood-to-metadata rule table (or a link to it).
- Four workflows and key features actually implemented.
- Stack and a short architecture description.
- Duel scoring and recommendation rules, including missing-data behavior and known limitations.
- Local setup, required environment-variable names (no secret values), and testing instructions.
- Deployment link/status, credits, and TMDB attribution/required notices.

Final submission requires source code in GitHub, an accessible deployed application/build, the README, a 3–5 minute demo, and the official form. Verify public links in a private browser window.

- **Project Name:** Movie Comp: Mood-Based Movie Discovery and Comparison
- **Student Name:** [Mohammed Zohaib]
- **Problem Statement:** Choosing a film that fits a current mood and deciding between options takes too much browsing; Movie Duel helps users discover, compare, and save suitable films.
- **GitHub Repository:** Add final URL.
- **Deployed Application / Build:** Add final URL.
- **Demo Video:** Add accessible 3–5 minute URL.
- **Tech Stack:** React, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, Mongoose, TMDB API.
- **Major Features:** Mood-based discovery, search/details, explainable Movie Duel, watchlist, mood-aware recommendations.
- **Deadline:** 27 October 2026, 11:59 PM IST.
- **Official form:** https://forms.gle/sBy4sfqyiRG2Zpom9

## 13. Demo Plan (3–5 Minutes)

1. Explain the mood-based movie choice problem and the product (20–30 seconds).
2. Choose a mood, browse tagged results, and show why a tag was assigned (45–60 seconds).
3. Search/open a movie and compare two titles for a chosen mood; explain criteria and missing-data behavior (60–90 seconds).
4. Save a movie and show the watchlist persistence (30–40 seconds).
5. Show recommendations changing with mood/genre preferences (30–40 seconds).
6. Briefly describe the stack and rule-based design (20–30 seconds).

Demo only working features. Do not spend most of the video reading code.

## 14. Acceptance Criteria

- [ ] Homepage loads real movie data and offers the defined mood choices.
- [ ] Mood tags come from documented app rules and show a simple reason.
- [ ] Search and movie details work, with loading/empty/error handling.
- [ ] Users can compare two different movies for a selected mood.
- [ ] Duel results show criterion scores, a transparent verdict, and correct missing-data behavior.
- [ ] Recommendations use mood/genre preferences and explain their matches.
- [ ] Watchlist persistence and ownership work if accounts are implemented; otherwise the limitation is explicit.
- [ ] Critical logic and workflows have been checked.
- [ ] No secrets are committed or exposed.
- [ ] README, accessible deployment/build, demo, and GitHub repository are ready before the deadline.

## 15. Risks and Limitations

- Mood is subjective. Derived labels are broad heuristics based on available metadata, not guarantees of emotional impact.
- TMDB data can be incomplete or unavailable; the app must disclose missing matches rather than invent them.
- The one-day deadline makes scope control important; optional features stay deferred until core workflows work.
- A changed PRD helps define a distinct direction, but changing a document alone does not establish originality. The implementation, design decisions, code, documentation, and attribution should reflect the student's own work and follow the project guidelines.

## 16. Summary

Movie Duel keeps its original discovery, comparison, watchlist, and recommendation concept while centering the experience on a user's current mood. Its mood tags are transparent app-derived rules over available TMDB metadata. Duel and recommendation results are deterministic and explainable; there is no LLM or trained ML model in the MVP.
